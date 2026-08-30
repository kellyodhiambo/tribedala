import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useState } from 'react';
import supabase from '@/hooks/useSupabase';

interface RichEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-500 underline hover:text-primary-600 cursor-pointer',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-96 p-4 bg-background-200 rounded-lg text-foreground-50',
      },
    },
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `blog/${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(path, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('content').getPublicUrl(path);
      const imageUrl = data.publicUrl;

      if (editor) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  const handleAddLink = () => {
    const url = prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
  const setH1 = () => editor?.chain().focus().toggleHeading({ level: 1 }).run();
  const setH2 = () => editor?.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
  const clearFormat = () => editor?.chain().focus().clearNodes().unsetAllMarks().run();

  if (!editor) return null;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 bg-background-100 rounded-lg border border-background-300/40">
        <button
          onClick={toggleBold}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bold') ? 'bg-primary-500 text-background-50' : 'hover:bg-background-200 text-foreground-400'
          }`}
          title="Bold (Ctrl+B)"
        >
          <i className="ri-bold text-lg" />
        </button>

        <button
          onClick={toggleItalic}
          className={`p-2 rounded transition-colors ${
            editor.isActive('italic') ? 'bg-primary-500 text-background-50' : 'hover:bg-background-200 text-foreground-400'
          }`}
          title="Italic (Ctrl+I)"
        >
          <i className="ri-italic text-lg" />
        </button>

        <button
          onClick={toggleUnderline}
          className={`p-2 rounded transition-colors ${
            editor.isActive('underline') ? 'bg-primary-500 text-background-50' : 'hover:bg-background-200 text-foreground-400'
          }`}
          title="Underline (Ctrl+U)"
        >
          <i className="ri-underline text-lg" />
        </button>

        <button
          onClick={toggleStrike}
          className={`p-2 rounded transition-colors ${
            editor.isActive('strike') ? 'bg-primary-500 text-background-50' : 'hover:bg-background-200 text-foreground-400'
          }`}
          title="Strikethrough"
        >
          <i className="ri-strikethrough text-lg" />
        </button>

        <div className="w-px bg-background-300/40" />

        <button
          onClick={setH1}
          className={`p-2 rounded transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-primary-500 text-background-50' : 'hover:bg-background-200 text-foreground-400'
          }`}
          title="Heading 1"
        >
          <i className="ri-h-1 text-lg" />
        </button>

        <button
          onClick={setH2}
          className={`p-2 rounded transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-primary-500 text-background-50' : 'hover:bg-background-200 text-foreground-400'
          }`}
          title="Heading 2"
        >
          <i className="ri-h-2 text-lg" />
        </button>

        <button
          onClick={toggleBulletList}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bulletList') ? 'bg-primary-500 text-background-50' : 'hover:bg-background-200 text-foreground-400'
          }`}
          title="Bullet List"
        >
          <i className="ri-list-unordered text-lg" />
        </button>

        <button
          onClick={toggleOrderedList}
          className={`p-2 rounded transition-colors ${
            editor.isActive('orderedList') ? 'bg-primary-500 text-background-50' : 'hover:bg-background-200 text-foreground-400'
          }`}
          title="Ordered List"
        >
          <i className="ri-list-ordered text-lg" />
        </button>

        <button
          onClick={toggleBlockquote}
          className={`p-2 rounded transition-colors ${
            editor.isActive('blockquote') ? 'bg-primary-500 text-background-50' : 'hover:bg-background-200 text-foreground-400'
          }`}
          title="Quote"
        >
          <i className="ri-quote-text text-lg" />
        </button>

        <div className="w-px bg-background-300/40" />

        <label className={`p-2 rounded transition-colors cursor-pointer ${
          uploading ? 'bg-primary-500/20' : 'hover:bg-background-200'
        } text-foreground-400`}
          title="Insert Image"
        >
          <i className="ri-image-add-line text-lg" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <button
          onClick={handleAddLink}
          className="p-2 rounded hover:bg-background-200 text-foreground-400 transition-colors"
          title="Add Link"
        >
          <i className="ri-link text-lg" />
        </button>

        <div className="w-px bg-background-300/40" />

        <button
          onClick={clearFormat}
          className="p-2 rounded hover:bg-background-200 text-foreground-400 transition-colors"
          title="Clear Formatting"
        >
          <i className="ri-format-clear text-lg" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
