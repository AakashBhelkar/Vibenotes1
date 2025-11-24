import { Note } from '@/lib/db';
import { NoteListItem } from './NoteListItem';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from './ui/badge';

interface NoteListProps {
    notes: Note[];
    selectedNote: Note | null;
    onSelectNote: (note: Note) => void;
    onCreateNote: () => void;
    onDeleteNote: (id: string) => void;
    onTogglePin: (id: string, isPinned: boolean) => void;
    onSearch: (query: string) => void;
    templateSelector?: React.ReactNode;
}


/**
 * Note list component with search and tag filtering
 * Displays all notes in a scrollable list
 */
export function NoteList({
    notes,
    selectedNote,
    onSelectNote,
    onCreateNote,
    onDeleteNote,
    onTogglePin,
    onSearch,
    templateSelector,
}: NoteListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Extract all unique tags from notes
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        notes.forEach(note => {
            note.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [notes]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        onSearch(query);
    };

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    const handleClearTags = () => {
        setSelectedTags([]);
    };

    // Filter notes by selected tags locally (AND logic - note must have ALL selected tags)
    const filteredNotes = useMemo(() => {
        if (selectedTags.length === 0) return notes;
        return notes.filter(note =>
            selectedTags.every(tag => note.tags.includes(tag))
        );
    }, [notes, selectedTags]);

    return (
        <div className="flex flex-col h-full border-r bg-card">
            {/* Header */}
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Notes</h2>
                    <Button onClick={onCreateNote} size="icon" aria-label="Create new note">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Template Selector */}
                {templateSelector && (
                    <div className="w-full">
                        {templateSelector}
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Filter by tags:</span>
                            {selectedTags.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearTags}
                                    className="h-6 px-2 text-xs"
                                >
                                    Clear ({selectedTags.length})
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {allTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer whitespace-nowrap"
                                    onClick={() => handleTagToggle(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredNotes.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No notes found</p>
                        {notes.length === 0 && <p className="text-sm">Click + to create your first note</p>}
                    </div>
                ) : (
                    filteredNotes.map(note => (
                        <NoteListItem
                            key={note.id}
                            note={note}
                            onSelect={onSelectNote}
                            onDelete={onDeleteNote}
                            onTogglePin={onTogglePin}
                            isSelected={selectedNote?.id === note.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
