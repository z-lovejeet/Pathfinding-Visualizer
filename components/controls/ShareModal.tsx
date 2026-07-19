'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (title: string) => Promise<{ url?: string; error?: string }>;
}

export function ShareModal({ isOpen, onClose, onShare }: ShareModalProps) {
  const [title, setTitle] = useState('Shared Grid');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError(null);
    setShareUrl(null);
    
    try {
      const result = await onShare(title.trim());
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        setShareUrl(result.url);
      }
    } catch {
      setError('An unexpected error occurred while sharing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setTitle('Shared Grid');
    setError(null);
    setShareUrl(null);
    setCopied(false);
    onClose();
  };

  return (
    <GlassModal isOpen={isOpen} onClose={handleClose} title="Share Grid">
      <div className="flex flex-col gap-4">
        {!shareUrl ? (
          <form onSubmit={handleShareSubmit} className="flex flex-col gap-4">
            <GlassInput
              label="Grid Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Impossible Maze"
              disabled={isLoading}
              autoFocus
            />
            
            {error && (
              <div className="p-3 rounded-lg bg-[rgba(255,71,87,0.1)] border border-[rgba(255,71,87,0.2)] text-[rgba(255,71,87,0.9)] text-xs">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-2">
              <GlassButton type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancel
              </GlassButton>
              <GlassButton type="submit" variant="primary" disabled={isLoading || !title.trim()} icon={isLoading ? Loader2 : Share2}>
                {isLoading ? 'Saving...' : 'Generate Link'}
              </GlassButton>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-[#00d4ff] break-all">
              {shareUrl}
            </div>
            <div className="flex justify-end gap-2">
              <GlassButton type="button" variant="ghost" onClick={handleClose}>
                Close
              </GlassButton>
              <GlassButton type="button" variant="primary" onClick={handleCopy} icon={copied ? Check : Copy}>
                {copied ? 'Copied!' : 'Copy Link'}
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    </GlassModal>
  );
}
