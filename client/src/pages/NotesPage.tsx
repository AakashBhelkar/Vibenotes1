import { useState, useEffect } from 'react';
import { NoteList } from '@/components/NoteList';
import { NoteEditor } from '@/components/NoteEditor';
import { ExportMenu } from '@/components/ExportMenu';
import { NoteAttachments } from '@/components/NoteAttachments';
import { StorageQuotaDisplay } from '@/components/StorageQuotaDisplay';
import { useNotes } from '@/hooks/useNotes';
import { useSyncStatus } from '@/hooks/useSync';
import { Note, NoteVersion } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, RefreshCw, LogOut, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { ModeToggle } from '@/components/ModeToggle';
import { TemplateSelector } from '@/components/TemplateSelector';
import { TemplateService, Template } from '@/services/templateService';
import { WelcomeModal } from '@/components/WelcomeModal';
import { onboardingService } from '@/services/onboardingService';
import { sampleNotes } from '@/data/sampleNotes';
import { analyticsService } from '@/services/analyticsService';
import { VersionHistory } from '@/components/VersionHistory';

/**
 * Main Notes page with list and editor
 * Provides full note management interface with offline support
 */
export default function NotesPage() {
    const navigate = useNavigate();
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);

    const { notes, createNote, updateNote, deleteNote, searchNotes, refresh } = useNotes();
    const { isOnline, isSyncing, sync } = useSyncStatus();

    // Check if this is the user's first visit
    useEffect(() => {
        if (onboardingService.isFirstVisit()) {
            setShowWelcome(true);
        }
    }, []);

    const handleCreateNote = async (): Promise<void> => {
        try {
            const newNote = await createNote('Untitled', '');
            setSelectedNote(newNote);
            setErrorMessage(null);
            analyticsService.trackNoteCreated();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create note';
            setErrorMessage(message);
        }
    };

    const handleDeleteNote = async (id: string): Promise<void> => {
        try {
            await deleteNote(id);
            if (selectedNote?.id === id) {
                setSelectedNote(null);
            }
            setErrorMessage(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete note';
            setErrorMessage(message);
        }
    };

    const handleTogglePin = async (id: string, isPinned: boolean): Promise<void> => {
        try {
            await updateNote(id, { isPinned });
            refresh();
            setErrorMessage(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to pin note';
            setErrorMessage(message);
        }
    };

    const handleSaveNote = async (id: string, updates: Partial<Note>): Promise<void> => {
        try {
            await updateNote(id, updates);
            setErrorMessage(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save note';
            setErrorMessage(message);
        }
    };

    const handleLogout = (): void => {
        authService.logout();
        navigate('/login');
    };

    const handleSync = async (): Promise<void> => {
        try {
            await sync();
            setErrorMessage(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sync';
            setErrorMessage(message);
        }
    };

    const handleImport = async (importedNotes: Partial<Note>[]): Promise<void> => {
        try {
            for (const note of importedNotes) {
                await createNote(note.title || 'Untitled', note.content || '', note.tags);
            }
            refresh();
            setErrorMessage(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to import notes';
            setErrorMessage(message);
        }
    };

    const handleSelectTemplate = async (template: Template): Promise<void> => {
        try {
            const noteData = TemplateService.createNoteFromTemplate(template);
            const newNote = await createNote(
                noteData.title || 'Untitled',
                noteData.content || '',
                noteData.tags
            );
            setSelectedNote(newNote);
            setErrorMessage(null);
            analyticsService.trackTemplateUsed(template.name, template.id.startsWith('custom-'));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create note from template';
            setErrorMessage(message);
        }
    };

    const handleCreateDailyNote = async (): Promise<void> => {
        try {
            const dailyNoteData = TemplateService.createDailyNote();
            const newNote = await createNote(
                dailyNoteData.title || 'Untitled',
                dailyNoteData.content || '',
                dailyNoteData.tags
            );
            setSelectedNote(newNote);
            setErrorMessage(null);
            analyticsService.trackDailyNoteCreated();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create daily note';
            setErrorMessage(message);
        }
    };

    const handleCreateSampleNotes = async (): Promise<void> => {
        try {
            if (!onboardingService.hasSampleNotes()) {
                // Create sample notes
                for (const sampleNote of sampleNotes) {
                    await createNote(sampleNote.title, sampleNote.content, sampleNote.tags);
                }
                onboardingService.markSampleNotesCreated();
                refresh();
            }
            onboardingService.completeOnboarding();
            analyticsService.trackOnboardingCompleted(!onboardingService.hasSampleNotes());
            setErrorMessage(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create sample notes';
            setErrorMessage(message);
        }
    };

    const handleRestoreVersion = async (version: NoteVersion): Promise<void> => {
        try {
            if (selectedNote) {
                await updateNote(selectedNote.id, {
                    title: version.title,
                    content: version.content,
                    tags: version.tags,
                });
                refresh();
                setShowVersionHistory(false);
                analyticsService.trackVersionRestored();
                setErrorMessage(null);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to restore version';
            setErrorMessage(message);
        }
    };


    return (
        <div className="h-screen flex flex-col">
            {/* Top Bar */}
            <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
                <h1 className="text-xl font-bold">VibeNotes</h1>

                <div className="flex items-center gap-2">
                    {/* Error Message */}
                    {errorMessage && (
                        <span className="text-sm text-destructive">{errorMessage}</span>
                    )}

                    {/* Online/Offline Indicator */}
                    <div className="flex items-center gap-2 text-sm">
                        {isOnline ? (
                            <Cloud className="h-4 w-4 text-green-500" />
                        ) : (
                            <CloudOff className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-muted-foreground">
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>

                    {/* Sync Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSync}
                        disabled={!isOnline || isSyncing}
                        aria-label="Sync notes"
                    >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    </Button>

                    {/* Export Menu */}
                    <ExportMenu
                        note={selectedNote}
                        notes={notes}
                        onImport={handleImport}
                        onError={setErrorMessage}
                    />

                    {/* Theme Toggle */}
                    <ModeToggle />

                    {/* Logout */}
                    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Note List Sidebar */}
                <div className="w-80 flex-shrink-0">
                    <NoteList
                        notes={notes}
                        selectedNote={selectedNote}
                        onSelectNote={setSelectedNote}
                        onCreateNote={handleCreateNote}
                        onDeleteNote={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                        onSearch={searchNotes}
                        templateSelector={
                            <TemplateSelector
                                onSelectTemplate={handleSelectTemplate}
                                onCreateDailyNote={handleCreateDailyNote}
                            />
                        }
                    />
                </div>

                {/* Note Editor */}
                <div className="flex-1 border-r flex flex-col">
                    {selectedNote && (
                        <div className="border-b p-2 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowVersionHistory(true);
                                    analyticsService.trackVersionHistoryViewed();
                                }}
                                title="Version History (Ctrl+H)"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                History
                            </Button>
                        </div>
                    )}
                    <NoteEditor
                        note={selectedNote}
                        onSave={handleSaveNote}
                        onError={setErrorMessage}
                    />
                </div>

                {/* Right Sidebar - Attachments (Disabled for v1) */}
                {/* <div className="w-80 flex-shrink-0 overflow-y-auto p-4 bg-muted/30">
                    <StorageQuotaDisplay />
                    {selectedNote && (
                        <NoteAttachments
                            noteId={selectedNote.id}
                            onError={setErrorMessage}
                        />
                    )}
                </div> */}
            </div>

            {/* Version History Modal */}
            {showVersionHistory && selectedNote && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background rounded-lg shadow-lg w-[90vw] h-[80vh] max-w-6xl">
                        <VersionHistory
                            noteId={selectedNote.id}
                            onRestore={handleRestoreVersion}
                            onClose={() => setShowVersionHistory(false)}
                        />
                    </div>
                </div>
            )}

            {/* Welcome Modal for First-Time Users */}
            <WelcomeModal
                open={showWelcome}
                onClose={() => {
                    setShowWelcome(false);
                    onboardingService.completeOnboarding();
                }}
                onCreateSampleNotes={handleCreateSampleNotes}
            />
        </div>
    );
}
