import React from 'react';

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  initialValue = '', 
  onChange,
  placeholder = 'Enter your notes here...'
}) => {
  return (
    <div className="w-full">
      <textarea
        defaultValue={initialValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[200px] p-4 border rounded-lg focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent resize-none"
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;