import { useState } from 'react';
import { NoteList } from '@/components/NoteList';
import { NoteEditor } from '@/components/NoteEditor';
import { ExportMenu } from '@/components/ExportMenu';
import { NoteAttachments } from '@/components/NoteAttachments';
import { StorageQuotaDisplay } from '@/components/StorageQuotaDisplay';
import { useNotes } from '@/hooks/useNotes';
import { useSyncStatus } from '@/hooks/useSync';
import { Note } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { ModeToggle } from '@/components/ModeToggle';
import { TemplateSelector } from '@/components/TemplateSelector';
import { TemplateService, Template } from '@/services/templateService';

/**
 * Main Notes page with list and editor
 * Provides full note management interface with offline support
 */
export default function NotesPage() {
    const navigate = useNavigate();
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { notes, createNote, updateNote, deleteNote, searchNotes, refresh } = useNotes();
    const { isOnline, isSyncing, sync } = useSyncStatus();

    const handleCreateNote = async (): Promise<void> => {
        try {
            const newNote = await createNote('Untitled', '');
            setSelectedNote(newNote);
            setErrorMessage(null);
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
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create daily note';
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
                <div className="flex-1 border-r">
                    <NoteEditor
                        note={selectedNote}
                        onSave={handleSaveNote}
                        onError={setErrorMessage}
                    />
                </div>

                {/* Right Sidebar - Attachments */}
                <div className="w-80 flex-shrink-0 overflow-y-auto p-4 bg-muted/30">
                    <StorageQuotaDisplay />
                    {selectedNote && (
                        <NoteAttachments
                            noteId={selectedNote.id}
                            onError={setErrorMessage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
