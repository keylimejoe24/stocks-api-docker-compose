import * as React from 'react';
import PropTypes from 'prop-types';
import { NumericFormat } from 'react-number-format';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import TextField from '@mui/material/TextField';

const StyledInput = styled(TextField)(({ theme }) => ({
    margin: theme.spacing(1),
}));
const NumberFormatCustom = React.forwardRef(function NumberFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
        <NumericFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value,
                    },
                });
            }}
            thousandSeparator
            valueIsNumericString
            prefix='$'
        />
    );
});

NumberFormatCustom.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default function CurrencyInput({ error, handleChange, value }) {
    const [values, setValues] = React.useState({
        numberformat: `${value}`,
    });
    React.useEffect(() => {
        setValues({
            numberformat: `${value}`,
        });
    }, [value]);
    const handleChangeInput = (event) => {
        handleChange(event);
        setValues({
            ...values,
            [event.target.name]: (event.target.value),
        });
    };
    // <TextField
    //     size="small"
    //     error={error ? true : false}
    //     helperText={error}
    //     
    //     
    //     name="price"
    //     id="formatted-numberformat-input"


    // />
    return (
        <StyledInput
            fullWidth
            name="styled-input"
            inputProps={{ style: { fontSize: 10 } }} // font size of input text
            InputLabelProps={{ style: { fontSize: 10 } }} // font size of input label
            size={'small'}
            value={values.numberformat}
            onChange={handleChangeInput}
            InputProps={{
                inputComponent: NumberFormatCustom,
            }}
            id="outlined-basic" label="Market Cap" variant="outlined" />
    );
}