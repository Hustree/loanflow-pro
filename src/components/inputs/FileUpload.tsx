import React, { useRef } from 'react';
import { Button, Box, Typography, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Clear as ClearIcon } from '@mui/icons-material';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  accept?: string;
  error?: boolean;
  helperText?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  accept = '*',
  error = false,
  helperText = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleClear = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-upload-input"
      />
      <label htmlFor="file-upload-input">
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{
            borderColor: error ? 'error.main' : 'primary.main',
            color: error ? 'error.main' : 'primary.main',
          }}
        >
          Upload File
        </Button>
      </label>
      
      {selectedFile && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Selected: {selectedFile.name}
          </Typography>
          <IconButton size="small" onClick={handleClear}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;