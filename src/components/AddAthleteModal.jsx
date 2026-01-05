import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddAthleteModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        parentName: '',
        parentPhone: '',
        contactEmail: '',
        birthDate: '',
        shirtSize: '',
        medicalNotes: '',
        allergies: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        onClose();
        setFormData({ name: '', nickname: '', parentName: '', parentPhone: '' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white">Add New Athlete</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Full Name *</label>
                        <input
                            required
                            type="text"
                            className="input-field"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nickname</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Johnny"
                            value={formData.nickname}
                            onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                        />
                    </div>

                    {/* Extended Contact Info */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Contact Email</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="email@example.com"
                            value={formData.contactEmail}
                            onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Birthdate</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.birthDate}
                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Shirt Size</label>
                            <select
                                className="input-field"
                                value={formData.shirtSize}
                                onChange={e => setFormData({ ...formData, shirtSize: e.target.value })}
                            >
                                <option value="">Select Size</option>
                                <option value="YS">Youth Small</option>
                                <option value="YM">Youth Medium</option>
                                <option value="YL">Youth Large</option>
                                <option value="YXL">Youth XL</option>
                                <option value="AS">Adult Small</option>
                                <option value="AM">Adult Medium</option>
                                <option value="AL">Adult Large</option>
                                <option value="AXL">Adult XL</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Parent Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Parent's Name"
                                value={formData.parentName}
                                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Parent Phone</label>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="(555) 123-4567"
                                value={formData.parentPhone}
                                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-amber-400/80 mb-1">Medical Notes</label>
                            <textarea
                                className="input-field min-h-[80px]"
                                placeholder="e.g. Asthma, Epipen required"
                                value={formData.medicalNotes || ''}
                                onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-amber-400/80 mb-1">Food Allergies</label>
                            <textarea
                                className="input-field min-h-[80px]"
                                placeholder="e.g. Peanuts, Dairy, Gluten"
                                value={formData.allergies || ''}
                                onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            Add Athlete
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAthleteModal;
