import React from 'react';
import { Check } from 'lucide-react';
import { avatars } from '../../lib/avatars';
import { cn } from '../../lib/utils';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
}

export function AvatarSelector({ selectedAvatar, onSelect }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {avatars.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar.url)}
          className={cn(
            "relative aspect-square rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105",
            "border-2",
            selectedAvatar === avatar.url
              ? "border-indigo-500 ring-2 ring-indigo-500 ring-offset-2"
              : "border-gray-200 hover:border-indigo-200"
          )}
        >
          <img
            src={avatar.url}
            alt={avatar.label}
            className="w-full h-full object-cover bg-white"
          />
          <div className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
            selectedAvatar === avatar.url ? "opacity-0" : "opacity-0 group-hover:opacity-100"
          )}>
            <p className="text-white text-sm font-medium">{avatar.label}</p>
          </div>
          {selectedAvatar === avatar.url && (
            <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}