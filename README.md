# 📚 Kalidas Editor Documentation

## 🚀 Overview

Kalidas is a powerful, modern rich-text editor built on top of Tiptap and designed for React applications. It provides a seamless writing experience with extensive formatting options, media support, and developer-friendly APIs.

## 🎯 Key Features

- ✨ **Rich Text Editing** - Bold, italic, strikethrough, and more
- 🖼️ **Media Support** - Image uploads with drag & drop
- ⚡ **Slash Commands** - Quick content insertion with `/` menu
- 🎨 **Custom Styling** - Fully customizable appearance
- 📱 **Responsive Design** - Works on all screen sizes
- 🔌 **Extensible** - Add custom extensions easily
- 💾 **State Management** - Built-in content persistence
- 🎪 **Bubble Menu** - Context-aware formatting toolbar

---

## 📦 Installation

```bash
npm install kalidas
```

## 🏗️ Basic Setup

```tsx
import { Editor } from "kalidas";
import "kalidas/dist/kalidas.css";

export default function MyApp() {
  return (
    <div>
      <Editor placeholder="Start writing..." />
    </div>
  );
}
```

---

## 🔧 API Reference

### Editor Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `"Write here..."` | Placeholder text when editor is empty |
| `extensions` | `Extension[]` | `[]` | Additional Tiptap extensions |
| `onUpdate` | `(content: string) => void` | `undefined` | Callback fired when content changes |
| `children` | `React.ReactNode` | `undefined` | Custom toolbar components |

### Editor Handle Methods

Access these methods via ref:

```tsx
const editorRef = useRef<EditorHandle>(null);

// Available methods:
editorRef.current?.getHTML()              // Get current content as HTML
editorRef.current?.setContent(html)       // Set editor content
editorRef.current?.clear()                // Clear all content
editorRef.current?.chain()                // Access Tiptap chain commands
```

---

## 💡 Usage Examples

### 1. Basic Editor with State Management

```tsx
import { Editor, type EditorHandle } from "kalidas";
import { useRef, useState } from "react";

export default function BasicEditor() {
  const editorRef = useRef<EditorHandle>(null);
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHTML();
      localStorage.setItem("content", html);
      console.log("Saved:", html);
    }
  };

  return (
    <div>
      <button onClick={handleSave}>Save</button>
      <Editor 
        ref={editorRef}
        placeholder="Type something..."
        onUpdate={setContent}
      />
    </div>
  );
}
```

### 2. Editor with Image Upload

```tsx
import { Editor, ImageNode, type NodeAsExtension, type ImageNodeOptions } from "kalidas";

export default function EditorWithImages() {
  const uploadImage = async (file: File): Promise<string> => {
    // Your upload logic here
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    
    const { url } = await response.json();
    return url;
  };

  return (
    <Editor
      placeholder="Drop images here..."
      extensions={[
        ImageNode.configure({
          upload: uploadImage,
        }) as unknown as NodeAsExtension<ImageNodeOptions>
      ]}
    />
  );
}
```

### 3. Advanced Editor with Custom Controls

```tsx
import { Editor, type EditorHandle } from "kalidas";
import { useRef, useState, useCallback } from "react";

export default function AdvancedEditor() {
  const editorRef = useRef<EditorHandle>(null);
  const [content, setContent] = useState("");

  const insertTemplate = useCallback((template: string) => {
    if (editorRef.current) {
      editorRef.current.chain().focus().insertContent(template).run();
    }
  }, []);

  const templates = {
    meetingNotes: `
      <h2>📅 Meeting Notes</h2>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Attendees:</strong> </p>
      <h3>Agenda:</h3>
      <ul><li>Item 1</li></ul>
      <h3>Action Items:</h3>
      <ul><li>Action 1</li></ul>
    `,
    taskList: `
      <h3>✅ Task List</h3>
      <ul>
        <li>Task 1 - In Progress</li>
        <li>Task 2 - Pending</li>
        <li>Task 3 - Completed ✅</li>
      </ul>
    `
  };

  return (
    <div className="space-y-4">
      {/* Template Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => insertTemplate(templates.meetingNotes)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          📅 Meeting Notes
        </button>
        <button 
          onClick={() => insertTemplate(templates.taskList)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          ✅ Task List
        </button>
      </div>

      {/* Editor */}
      <Editor
        ref={editorRef}
        placeholder="Choose a template or start typing..."
        onUpdate={setContent}
      />
      
      {/* Content Stats */}
      <div className="text-sm text-gray-500">
        Characters: {content.length} | 
        Words: {content.split(/\s+/).filter(w => w.length > 0).length}
      </div>
    </div>
  );
}
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | **Bold** text |
| `Ctrl/Cmd + I` | *Italic* text |
| `Ctrl/Cmd + U` | Underline text |
| `Ctrl/Cmd + K` | Add link |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + Shift + X` | ~~Strikethrough~~ |
| `#` + `Space` | Heading 1 |
| `##` + `Space` | Heading 2 |
| `###` + `Space` | Heading 3 |
| `*` + `Space` | Bullet list |
| `1.` + `Space` | Numbered list |
| `>` + `Space` | Blockquote |
| ``` + `Space` | Code block |
| `/` | Open slash command menu |

---

## 🎨 Styling & Customization

### CSS Classes

The editor uses these CSS classes for styling:

```css
/* Main editor container */
.kali-editorcontent {
  /* Your custom styles */
}

/* Bubble toolbar */
.bubble-toolbar {
  /* Toolbar styling */
}

.bubble-button {
  /* Button styling */
}

.bubble-button.active {
  /* Active button state */
}

/* Placeholder text */
.ProseMirror p.is-editor-empty:first-child::before {
  /* Placeholder styling */
}
```

### Custom Theme Example

```css
.kali-editorcontent {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  color: #374151;
}

.kali-editorcontent h1 {
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin: 1.5rem 0 1rem 0;
}

.kali-editorcontent blockquote {
  border-left: 4px solid #3b82f6;
  background: #f8fafc;
  padding: 1rem;
  margin: 1rem 0;
  font-style: italic;
}
```

---

## 🔌 Available Extensions

The editor comes with these built-in extensions:

- **StarterKit** - Basic editing functionality
- **TaskList & TaskItem** - Checkbox lists
- **YouTube** - YouTube video embeds
- **Twitter** - Tweet embeds  
- **ImageNode** - Image handling
- **SlashCommand** - Slash command menu
- **Placeholder** - Placeholder text

### Adding Custom Extensions

```tsx
import { Editor } from "kalidas";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";

export default function CustomEditor() {
  return (
    <Editor
      extensions={[
        Link.configure({
          openOnClick: false,
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ]}
    />
  );
}
```

---

## 🎪 Slash Commands

Type `/` anywhere in the editor to open the command menu:

| Command | Description |
|---------|-------------|
| `/h1` | Heading 1 |
| `/h2` | Heading 2 |
| `/h3` | Heading 3 |
| `/p` | Paragraph |
| `/ul` | Bullet List |
| `/ol` | Numbered List |
| `/quote` | Blockquote |
| `/code` | Code Block |
| `/youtube` | YouTube Embed |
| `/twitter` | Twitter Embed |

---

## 💾 State Management Patterns

### 1. Simple Local State

```tsx
const [content, setContent] = useState("");

<Editor onUpdate={setContent} />
```

### 2. Persistent Storage

```tsx
const [content, setContent] = useState(() => {
  return localStorage.getItem("editor-content") || "";
});

const handleUpdate = useCallback((newContent: string) => {
  setContent(newContent);
  localStorage.setItem("editor-content", newContent);
}, []);

<Editor onUpdate={handleUpdate} />
```

### 3. Auto-save with Debouncing

```tsx
import { useDebounce } from "use-debounce";

const [content, setContent] = useState("");
const [debouncedContent] = useDebounce(content, 1000);

useEffect(() => {
  if (debouncedContent) {
    // Auto-save logic
    fetch("/api/save", {
      method: "POST",
      body: JSON.stringify({ content: debouncedContent })
    });
  }
}, [debouncedContent]);
```

---

## 🚨 Common Issues & Solutions

### Issue: TypeScript Errors with Extensions

**Problem:** Type errors when adding extensions

**Solution:** Use proper type casting:

```tsx
import { ImageNode, type NodeAsExtension, type ImageNodeOptions } from "kalidas";

<Editor
  extensions={[
    ImageNode.configure({
      upload: uploadFn,
    }) as unknown as NodeAsExtension<ImageNodeOptions>
  ]}
/>
```

### Issue: Editor Not Updating on External Changes

**Problem:** Editor content doesn't update when setting content externally

**Solution:** Use the ref methods:

```tsx
// ❌ Wrong
setContent(newContent);

// ✅ Correct  
editorRef.current?.setContent(newContent);
```

### Issue: Styles Not Loading

**Problem:** Editor appears unstyled

**Solution:** Import the CSS file:

```tsx
import "kalidas/dist/kalidas.css";
```

---

## 📱 Mobile Considerations

- Touch gestures are supported out of the box
- Bubble menu automatically adjusts for mobile screens
- Virtual keyboard handling is built-in
- Use responsive design for custom controls

---

## 🔒 Security Notes

- Always sanitize HTML content on the server side
- Be cautious with `dangerouslySetInnerHTML` if rendering editor output
- Validate file uploads for the ImageNode extension
- Consider implementing rate limiting for auto-save features

---

## 📈 Performance Tips

1. **Use React.memo** for wrapper components
2. **Debounce** the `onUpdate` callback for expensive operations
3. **Lazy load** extensions that aren't immediately needed
4. **Optimize images** before uploading via ImageNode
5. **Implement pagination** for large documents

---

## 🤝 Contributing

Found a bug or want to contribute? 

1. Check the existing issues
2. Fork the repository
3. Create a feature branch
4. Submit a pull request

---

## 📄 License

Kalidas Editor is open source software licensed under the [MIT License](LICENSE).

---

## 🆘 Support

Need help? Check out:

- 📖 [Examples Repository](https://github.com/abhishekhojha/kalidas_test)
- 📧 [Email Support](mailto:qabhishekhojha@gmail.com)

---

*Happy writing with Kalidas! 🚀*