'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, Image as ImageIcon, Music, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UploadPanelProps {
    onUploadComplete: (task: any) => void;
}

export default function UploadPanel({ onUploadComplete }: UploadPanelProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setIsUploading(true);
        setUploadStatus('idle');
        setMessage('Processing with AI...');

        const formData = new FormData();
        formData.append('file', file);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${API_BASE_URL}/api/v1/tasks/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to process file');

            const data = await response.json();
            
            // If confidence is low, we don't consider it a "success" yet in the UI
            if (data.confidence < 0.7) {
                setMessage('AI needs your confirmation...');
            } else {
                setUploadStatus('success');
                setMessage('Task extracted successfully!');
            }
            
            onUploadComplete(data);

            if (data.confidence >= 0.7) {
                // Reset status after a few seconds
                setTimeout(() => {
                    setUploadStatus('idle');
                    setMessage('');
                }, 3000);
            }

        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            setMessage('Extraction failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/pdf': ['.pdf'],
            'audio/*': ['.mp3', '.wav', '.m4a']
        },
        maxFiles: 1
    });

    return (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
            {/* Decorative gradient orb */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] group-hover:bg-indigo-500/30 transition-colors duration-700 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center">

                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
                    New Task from File
                </h2>
                <p className="text-slate-400 mb-8 max-w-md text-sm">
                    Upload a screenshot, receipt, PDF document, or voice note. Our AI will automatically extract the to-do list, deadlines, and priorities for you.
                </p>

                <div
                    {...getRootProps()}
                    className={`w-full max-w-xl mx-auto rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer p-10 flex flex-col items-center justify-center
            ${isDragActive
                            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]'
                            : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50'
                        }
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
                >
                    <input {...getInputProps()} />

                    {isUploading ? (
                        <div className="flex flex-col items-center gap-4 text-indigo-400">
                            <Loader2 className="w-12 h-12 animate-spin" />
                            <p className="font-medium animate-pulse">{message}</p>
                        </div>
                    ) : uploadStatus === 'success' ? (
                        <div className="flex flex-col items-center gap-4 text-emerald-400">
                            <CheckCircle2 className="w-12 h-12" />
                            <p className="font-medium">{message}</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-inner relative group-hover:scale-110 transition-transform duration-500">
                                <UploadCloud className="w-10 h-10 text-indigo-400 group-hover:text-indigo-300 transition-colors" />

                                {/* Micro-icons decorating the main icon */}
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center shadow-lg border border-slate-600">
                                    <ImageIcon className="w-3 h-3 text-slate-300" />
                                </div>
                                <div className="absolute top-10 -left-2 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center shadow-lg border border-slate-600">
                                    <Music className="w-3 h-3 text-slate-300" />
                                </div>
                            </div>

                            <p className="text-lg font-medium text-slate-200 mb-2">
                                {isDragActive ? 'Drop file here to extract' : 'Drag & drop image, PDF, or audio'}
                            </p>
                            <p className="text-sm text-slate-500 font-medium bg-slate-800/50 px-3 py-1 rounded-full">
                                or click to browse
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
