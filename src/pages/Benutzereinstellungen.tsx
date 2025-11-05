import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

interface UserSettings {
    timeFormat: 'minutes' | 'hours';
    dailyWorkHours: {
        monday: number;
        tuesday: number;
        wednesday: number;
        thursday: number;
        friday: number;
        saturday: number;
        sunday: number;
    };
    defaultBreaks: Array<{
        start: string;
        end: string;
        duration: number;
    }>;
    plans: {
        VOR_ORT: {
            name: string;
            start: number;
            end: number;
            max: number;
        };
        HOMEOFFICE: {
            name: string;
            start: number;
            end: number;
            max: number;
        };
    };
}

const Benutzereinstellungen: React.FC = () => {
    const [settings, setSettings] = useState<UserSettings>({
        timeFormat: 'minutes',
        dailyWorkHours: {
            monday: 480,
            tuesday: 480,
            wednesday: 480,
            thursday: 480,
            friday: 480,
            saturday: 0,
            sunday: 0
        },
        defaultBreaks: [
            {start: '09:00', end: '09:15', duration: 15},
            {start: '12:00', end: '12:30', duration: 30}
        ],
        plans: {
            VOR_ORT: {
                name: 'Vor Ort',
                start: 360, // 6:00
                end: 1050, // 17:30
                max: 600 // 10h
            },
            HOMEOFFICE: {
                name: 'Homeoffice',
                start: 360, // 6:00
                end: 1200, // 20:00
                max: 600 // 10h
            }
        }
    });

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Lade Einstellungen beim Start
    useEffect(() => {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(prev => ({...prev, ...parsed}));
            } catch (error) {
                // Error loading settings
            }
        }
    }, []);

    // Speichere Einstellungen bei Änderungen
    useEffect(() => {
        localStorage.setItem('userSettings', JSON.stringify(settings));
    }, [settings]);

    const formatTime = (minutes: number, format: 'minutes' | 'hours'): string => {
        if (format === 'hours') {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        }
        return minutes.toString();
    };

    const parseTime = (value: string, format: 'minutes' | 'hours'): number => {
        if (format === 'hours') {
            const [hours, minutes] = value.split(':').map(Number);
            return (hours || 0) * 60 + (minutes || 0);
        }
        return parseInt(value) || 0;
    };


    const handleTimeFormatChange = (newFormat: 'minutes' | 'hours') => {
        setSettings(prev => ({
            ...prev,
            timeFormat: newFormat
        }));
    };

    const updateDailyWorkHours = (day: keyof UserSettings['dailyWorkHours'], value: string) => {
        const minutes = parseTime(value, settings.timeFormat);
        setSettings(prev => ({
            ...prev,
            dailyWorkHours: {
                ...prev.dailyWorkHours,
                [day]: minutes
            }
        }));
    };

    const updateBreak = (index: number, field: 'start' | 'end' | 'duration', value: string) => {
        setSettings(prev => ({
            ...prev,
            defaultBreaks: prev.defaultBreaks.map((breakItem, i) => {
                if (i === index) {
                    if (field === 'duration') {
                        return {...breakItem, [field]: parseInt(value) || 0};
                    }
                    return {...breakItem, [field]: value};
                }
                return breakItem;
            })
        }));
    };

    const addBreak = () => {
        setSettings(prev => ({
            ...prev,
            defaultBreaks: [...prev.defaultBreaks, {start: '00:00', end: '00:00', duration: 0}]
        }));
    };

    const removeBreak = (index: number) => {
        setSettings(prev => ({
            ...prev,
            defaultBreaks: prev.defaultBreaks.filter((_, i) => i !== index)
        }));
    };

    const updatePlan = (planKey: keyof UserSettings['plans'], field: 'name' | 'start' | 'end' | 'max', value: string) => {
        const minutes = parseTime(value, 'hours'); // Anwesenheitspläne verwenden immer Stundenformat
        setSettings(prev => ({
            ...prev,
            plans: {
                ...prev.plans,
                [planKey]: {
                    ...prev.plans[planKey],
                    [field]: field === 'name' ? value : minutes
                }
            }
        }));
    };

    const exportSettings = () => {
        try {
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'arbeitszeiterfassung-einstellungen.json';
            link.click();
            URL.revokeObjectURL(url);
            setMessage({type: 'success', text: 'Einstellungen erfolgreich exportiert!'});
        } catch (error) {
            setMessage({type: 'error', text: 'Fehler beim Exportieren der Einstellungen!'});
        }
    };

    const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target?.result as string);
                setSettings(prev => ({...prev, ...importedSettings}));
                setMessage({type: 'success', text: 'Einstellungen erfolgreich importiert!'});
            } catch (error) {
                setMessage({type: 'error', text: 'Fehler beim Importieren der Einstellungen!'});
            }
        };
        reader.readAsText(file);
    };

    const resetToDefaults = () => {
        if (window.confirm('Möchten Sie wirklich alle Einstellungen auf Standard zurücksetzen?')) {
            setSettings({
                timeFormat: 'minutes',
                dailyWorkHours: {
                    monday: 480,
                    tuesday: 480,
                    wednesday: 480,
                    thursday: 480,
                    friday: 480,
                    saturday: 0,
                    sunday: 0
                },
                defaultBreaks: [
                    {start: '09:00', end: '09:15', duration: 15},
                    {start: '12:00', end: '12:30', duration: 30}
                ],
                plans: {
                    VOR_ORT: {
                        name: 'Vor Ort',
                        start: 360,
                        end: 1050,
                        max: 600
                    },
                    HOMEOFFICE: {
                        name: 'Homeoffice',
                        start: 360,
                        end: 1200,
                        max: 600
                    }
                }
            });
            setMessage({type: 'success', text: 'Einstellungen auf Standard zurückgesetzt!'});
        }
    };

    const dayNames = {
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag'
    };

    return (
        <div className="max-w-6xl mx-auto glass-effect p-6">
            <div className="mb-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
                >
                    <span>←</span> Zurück zur Arbeitszeiterfassung
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-white mb-8">Benutzereinstellungen</h1>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success'
                        ? 'bg-green-500/20 border border-green-400/30 text-green-200'
                        : 'bg-red-500/20 border border-red-400/30 text-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Zeitformat */}
                <div className="bg-white/10 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Zeitformat</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-white">
                                <input
                                    type="radio"
                                    name="timeFormat"
                                    checked={settings.timeFormat === 'minutes'}
                                    onChange={() => handleTimeFormatChange('minutes')}
                                    className="text-blue-500"
                                />
                                Minuten
                            </label>
                            <label className="flex items-center gap-2 text-white">
                                <input
                                    type="radio"
                                    name="timeFormat"
                                    checked={settings.timeFormat === 'hours'}
                                    onChange={() => handleTimeFormatChange('hours')}
                                    className="text-blue-500"
                                />
                                Stunden:Minuten
                            </label>
                        </div>
                    </div>
                </div>

                {/* Tägliche Arbeitszeiten */}
                <div className="bg-white/10 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Tägliche Arbeitszeiten</h2>
                    <div className="space-y-3">
                        {Object.entries(dayNames).map(([day, name]) => (
                            <div key={day} className="flex items-center justify-between">
                                <label className="text-white w-24">{name}:</label>
                                <input
                                    type={settings.timeFormat === 'hours' ? 'time' : 'number'}
                                    value={formatTime(settings.dailyWorkHours[day as keyof UserSettings['dailyWorkHours']], settings.timeFormat)}
                                    onChange={(e) => updateDailyWorkHours(day as keyof UserSettings['dailyWorkHours'], e.target.value)}
                                    className="w-32 p-2 rounded bg-white/20 text-white border border-white/30"
                                    min={settings.timeFormat === 'hours' ? undefined : 0}
                                    step={settings.timeFormat === 'hours' ? undefined : 1}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vordefinierte Pausenzeiten */}
                <div className="bg-white/10 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Vordefinierte Pausenzeiten</h2>
                    <div className="space-y-3">
                        {settings.defaultBreaks.map((breakItem, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="time"
                                    value={breakItem.start}
                                    onChange={(e) => updateBreak(index, 'start', e.target.value)}
                                    className="w-24 p-2 rounded bg-white/20 text-white border border-white/30"
                                />
                                <input
                                    type="time"
                                    value={breakItem.end}
                                    onChange={(e) => updateBreak(index, 'end', e.target.value)}
                                    className="w-24 p-2 rounded bg-white/20 text-white border border-white/30"
                                />
                                <input
                                    type="number"
                                    value={breakItem.duration}
                                    onChange={(e) => updateBreak(index, 'duration', e.target.value)}
                                    className="w-20 p-2 rounded bg-white/20 text-white border border-white/30"
                                    min="0"
                                />
                                <span className="text-white text-sm">Min</span>
                                <button
                                    onClick={() => removeBreak(index)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addBreak}
                            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            + Pause hinzufügen
                        </button>
                    </div>
                </div>

                {/* Anwesenheitspläne */}
                <div className="bg-white/10 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Anwesenheitspläne</h2>
                    <div className="space-y-6">
                        {Object.entries(settings.plans).map(([planKey, plan]) => (
                            <div key={planKey} className="border border-white/20 rounded p-4">
                                <h3 className="text-lg font-medium text-white mb-3">{plan.name}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-white">Name:</label>
                                        <input
                                            type="text"
                                            value={plan.name}
                                            onChange={(e) => updatePlan(planKey as keyof UserSettings['plans'], 'name', e.target.value)}
                                            className="w-32 p-2 rounded bg-white/20 text-white border border-white/30"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-white">Start:</label>
                                        <input
                                            type="time"
                                            value={formatTime(plan.start, 'hours')}
                                            onChange={(e) => updatePlan(planKey as keyof UserSettings['plans'], 'start', e.target.value)}
                                            className="w-32 p-2 rounded bg-white/20 text-white border border-white/30"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-white">Ende:</label>
                                        <input
                                            type="time"
                                            value={formatTime(plan.end, 'hours')}
                                            onChange={(e) => updatePlan(planKey as keyof UserSettings['plans'], 'end', e.target.value)}
                                            className="w-32 p-2 rounded bg-white/20 text-white border border-white/30"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-white">Max:</label>
                                        <input
                                            type="time"
                                            value={formatTime(plan.max, 'hours')}
                                            onChange={(e) => updatePlan(planKey as keyof UserSettings['plans'], 'max', e.target.value)}
                                            className="w-32 p-2 rounded bg-white/20 text-white border border-white/30"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Export/Import */}
            <div className="mt-8 bg-white/10 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Einstellungen verwalten</h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={exportSettings}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        📤 Exportieren
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
                        📥 Importieren
                        <input
                            type="file"
                            accept=".json"
                            onChange={importSettings}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={resetToDefaults}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        🔄 Standard zurücksetzen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Benutzereinstellungen;
