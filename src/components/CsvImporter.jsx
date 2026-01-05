import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

const CsvImporter = ({ onImport }) => {
    const fileInputRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [message, setMessage] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatus('processing');
        setMessage('Parsing CSV...');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setStatus('error');
                    setMessage(`Error parsing CSV: ${results.errors[0].message}`);
                    return;
                }

                // Validate and map fields
                // Expects: Athlete Name, Athlete Nickname, Parent Name, Parent Phone Number
                // Or roughly similar variations
                const athletes = results.data.map(row => {
                    // Flexible key matching
                    const keys = Object.keys(row);
                    const nameKey = keys.find(k => /name/i.test(k) && /athlete|child|kid/i.test(k)) || keys.find(k => /name/i.test(k));
                    const nicknameKey = keys.find(k => /nick/i.test(k));
                    const parentKey = keys.find(k => /parent/i.test(k) && /name/i.test(k));
                    const phoneKey = keys.find(k => /phone/i.test(k));
                    const medicalKey = keys.find(k => /medical/i.test(k) || /notes/i.test(k) && /med/i.test(k));
                    const allergiesKey = keys.find(k => /allergy|allergies/i.test(k));

                    return {
                        name: row[nameKey] || row['Name'] || 'Unknown',
                        nickname: row[nicknameKey] || '',
                        parentName: row[parentKey] || '',
                        parentPhone: row[phoneKey] || '',
                        medicalNotes: row[medicalKey] || '',
                        allergies: row[allergiesKey] || ''
                    };
                }).filter(a => a.name && a.name !== 'Unknown');

                if (athletes.length === 0) {
                    setStatus('error');
                    setMessage('No valid athletes found. Check column headers.');
                } else {
                    onImport(athletes);
                    setStatus('success');
                    setMessage(`Successfully imported ${athletes.length} athletes!`);
                    setTimeout(() => {
                        setStatus('idle');
                        setMessage('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }, 3000);
                }
            },
            error: (err) => {
                setStatus('error');
                setMessage('Failed to read file.');
            }
        });
    };

    return (
        <div className="w-full">
            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={status === 'processing'}
                className={clsx(
                    "w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all",
                    status === 'idle' && "border-slate-600 hover:border-blue-400 hover:bg-slate-800/50 text-slate-400 hover:text-blue-400",
                    status === 'success' && "border-green-500 bg-green-500/10 text-green-400",
                    status === 'error' && "border-red-500 bg-red-500/10 text-red-400"
                )}
            >
                {status === 'idle' && (
                    <>
                        <Upload size={24} className="mb-2" />
                        <span className="font-semibold">Import CSV</span>
                        <span className="text-xs mt-1 text-slate-500">Name, Nickname, Parent Name, Phone</span>
                    </>
                )}
                {status === 'processing' && <span className="animate-pulse">Processing...</span>}
                {status === 'success' && (
                    <>
                        <CheckCircle size={24} className="mb-2" />
                        <span className="text-sm font-semibold">{message}</span>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <AlertCircle size={24} className="mb-2" />
                        <span className="text-sm font-semibold">{message}</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default CsvImporter;
