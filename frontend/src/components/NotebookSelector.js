import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const NotebookList = ['Afnan Notes', 'Ashmaan Notes'];

export default function NotebookSelector() {
  const [value, setValue] = React.useState(NotebookList[0]);
  const [inputValue, setInputValue] = React.useState('');

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