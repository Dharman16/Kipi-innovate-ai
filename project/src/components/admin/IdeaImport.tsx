import React, { useState, useRef } from 'react';
import { FileUp, Download, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useCreateIdea } from '../../lib/api/ideas';
import { useAuth } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface ValidationError {
  row: number;
  errors: string[];
}

interface ImportResults {
  total: number;
  success: number;
  failed: number;
}

// Parse CSV while handling quoted values correctly
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Handle escaped quotes
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      currentRow.push(currentValue.trim());
      currentValue = '';
    } else if (char === '\n' && !insideQuotes) {
      // End of row
      currentRow.push(currentValue.trim());
      if (currentRow.some(value => value)) { // Only add non-empty rows
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Handle last row if any
  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    if (currentRow.some(value => value)) { // Only add non-empty rows
      rows.push(currentRow);
    }
  }

  return rows;
}

export function IdeaImport() {
  const { user } = useAuth();
  const { mutate: createIdea } = useCreateIdea();
  const [importing, setImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = [
      'title,description,category,status,author_email,contributor_emails,resource_links',
      '"Example Idea","This is a description with, commas","Lammas - Accelerator & Native Apps","pending","author@kipi.ai","contributor1@kipi.ai,contributor2@kipi.ai","[{""title"":""Documentation"",""url"":""https://example.com""}]"'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ideas_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validateRow = async (values: string[], rowIndex: number) => {
    const errors: string[] = [];
    
    try {
      const [title, description, category, status, authorEmail, contributorEmails, resourceLinks] = values;

      // Required fields
      if (!title?.trim()) errors.push('Title is required');
      if (!description?.trim()) errors.push('Description is required');
      if (!category?.trim()) errors.push('Category is required');
      if (!authorEmail?.trim()) errors.push('Author email is required');

      // Validate category
      const validCategories = [
        'Lammas - Accelerator & Native Apps',
        'Technology COE - Reusable Assets/Enablers',
        'Delivery - Process Improvement',
        'Industry Solutions - Domain Expertise & Business Use Cases',
        'Data Science',
        'Learning & Development',
        'Sales & Marketing',
        'Operations, HR, CSM, ESM, etc.'
      ];
      if (!validCategories.includes(category?.trim())) {
        errors.push('Invalid category');
      }

      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (status && !validStatuses.includes(status.trim())) {
        errors.push('Invalid status');
      }

      // Validate author email
      if (authorEmail?.trim()) {
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', authorEmail.trim())
          .maybeSingle();

        if (authorError || !authorData) {
          errors.push(`Author email ${authorEmail} not found`);
        }
      }

      // Validate contributor emails
      if (contributorEmails?.trim()) {
        const emails = contributorEmails.split(',').map(email => email.trim()).filter(Boolean);
        if (emails.length > 0) {
          const { data: contributorsData, error: contributorsError } = await supabase
            .from('profiles')
            .select('id, email')
            .in('email', emails);

          if (contributorsError) {
            errors.push('Error validating contributor emails');
          } else {
            const foundEmails = new Set(contributorsData?.map(c => c.email));
            const missingEmails = emails.filter(email => !foundEmails.has(email));
            if (missingEmails.length > 0) {
              errors.push(`Contributors not found: ${missingEmails.join(', ')}`);
            }
          }
        }
      }

      // Validate resource links
      if (resourceLinks?.trim()) {
        try {
          const links = JSON.parse(resourceLinks);
          if (!Array.isArray(links)) {
            errors.push('Resource links must be an array');
          } else {
            const validLinks = links.every((link: any) => 
              typeof link === 'object' &&
              typeof link.title === 'string' && 
              typeof link.url === 'string' &&
              link.url.startsWith('http')
            );
            if (!validLinks) {
              errors.push('Invalid resource links format');
            }
          }
        } catch (error) {
          errors.push('Invalid resource links JSON');
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      errors.push('Failed to validate row');
    }

    return errors;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setImporting(true);
    setValidationErrors([]);
    setImportResults(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        throw new Error('File must contain a header row and at least one data row');
      }

      const headerRow = rows[0];
      const expectedHeaders = ['title', 'description', 'category', 'status', 'author_email', 'contributor_emails', 'resource_links'];
      
      if (headerRow.length !== expectedHeaders.length || 
          !expectedHeaders.every((header, i) => headerRow[i].toLowerCase().trim() === header)) {
        throw new Error('Invalid CSV format. Please use the template provided.');
      }

      const dataRows = rows.slice(1);

      // Validate all rows
      const validationPromises = dataRows.map((row, index) => validateRow(row, index));
      const validationResults = await Promise.all(validationPromises);

      const errors = validationResults
        .map((errors, index) => errors.length > 0 ? { row: index + 1, errors } : null)
        .filter((error): error is ValidationError => error !== null);

      setValidationErrors(errors);

      if (errors.length === 0) {
        // Import ideas
        let successCount = 0;
        let failedCount = 0;

        for (const row of dataRows) {
          try {
            const [title, description, category, status, authorEmail, contributorEmails, resourceLinks] = row;

            // Get author ID
            const { data: authorData } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', authorEmail.trim())
              .single();

            if (!authorData) throw new Error('Author not found');

            // Create idea
            await createIdea({
              title: title.trim(),
              description: description.trim(),
              category: category.trim(),
              status: status.trim() || 'pending',
              author_id: authorData.id,
              resource_links: resourceLinks ? JSON.parse(resourceLinks) : []
            }, {
              onSuccess: async (idea) => {
                // Add contributors if any
                if (contributorEmails?.trim()) {
                  const emails = contributorEmails.split(',').map(email => email.trim()).filter(Boolean);
                  if (emails.length > 0) {
                    const { data: contributors } = await supabase
                      .from('profiles')
                      .select('id')
                      .in('email', emails);

                    if (contributors?.length) {
                      await Promise.all(
                        contributors.map(contributor =>
                          supabase
                            .from('idea_contributors')
                            .insert({
                              idea_id: idea.id,
                              user_id: contributor.id
                            })
                        )
                      );
                    }
                  }
                }
              }
            });

            successCount++;
          } catch (error) {
            console.error('Error importing idea:', error);
            failedCount++;
          }
        }

        setImportResults({
          total: dataRows.length,
          success: successCount,
          failed: failedCount
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setValidationErrors([{
        row: 0,
        errors: [(error as Error).message || 'Failed to process file. Please check the format.']
      }]);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Import Ideas</h2>
          <p className="text-sm text-gray-500">
            Import ideas from a CSV file. Download the template below to ensure correct formatting.
          </p>
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">CSV Format Instructions:</h3>
            <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
              <li>Basic fields: title, description, category, status, author_email</li>
              <li>contributor_emails: Comma-separated list of contributor email addresses</li>
              <li>resource_links: JSON array of objects with title and url properties</li>
              <li>Example resource links: [{'"title":"Documentation","url":"https://example.com"'}]</li>
              <li>Use quotes for values containing commas</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          {/* Template Download */}
          <div>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={importing}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  CSV files only
                </p>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Validation errors found
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>
                          {error.row === 0 ? 'File error' : `Row ${error.row}`}: {error.errors.join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Import Status */}
          {importing && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin mr-2" />
                <p className="text-sm text-blue-700">
                  Importing ideas... Please wait.
                </p>
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <div className={cn(
              "mt-4 p-4 rounded-md",
              importResults.failed === 0 ? "bg-green-50" : "bg-yellow-50"
            )}>
              <div className="flex">
                {importResults.failed === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-yellow-400 mr-2" />
                )}
                <div>
                  <h3 className={cn(
                    "text-sm font-medium",
                    importResults.failed === 0 ? "text-green-800" : "text-yellow-800"
                  )}>
                    Import completed
                  </h3>
                  <div className="mt-2 text-sm">
                    <p className={importResults.failed === 0 ? "text-green-700" : "text-yellow-700"}>
                      Successfully imported {importResults.success} of {importResults.total} ideas.
                      {importResults.failed > 0 && ` Failed to import ${importResults.failed} ideas.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}