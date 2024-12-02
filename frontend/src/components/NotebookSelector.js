import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function NotebookSelector({ NotebookList }) {
  console.log('NotebookList :>> ', NotebookList);
  const [value, setValue] = useState(NotebookList[0]);
  const [inputValue, setInputValue] = useState('');

  return (
    <div>
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        id="controllable-states-demo"
        options={NotebookList}
        sx={{ width: 300, margin: '10px' }}
        renderInput={(params) => <TextField {...params} label="" />}
      />
    </div>
  );
}