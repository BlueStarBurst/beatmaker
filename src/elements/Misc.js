import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";

export function ErrorTextField(props) {
	const { minLength, maxLength, returnError, alphaNumeric, ...otherProps } =
		props;
	const [error, setError] = useState(false);
	const [initial, setInitial] = useState(true);
	const [errorMsg, setErrorMsg] = useState("");
    const [id, setId] = useState(Math.random().toString(36).substring(7));

	function getError() {
		if (alphaNumeric) {
			if (!props.value.match(/^[a-z0-9]+$/i)) {
				setErrorMsg("Must be alphanumeric");
				return true;
			}
		}

		if (props.value.length < minLength || props.value.length > maxLength) {
			setErrorMsg(`Must be between ${minLength} and ${maxLength} characters`);
			return true;
		} else {
			setErrorMsg("");
			return false;
		}
	}

	useEffect(() => {
		var err = getError();
		if (initial) {
			setInitial(false);
			returnError(id,err);
			return;
		}
		setError(err);
		returnError(id,err);
	}, [props.value]);

	return (
		<TextField
			{...otherProps}
			error={error}
			helperText={error ? errorMsg : ""}
		/>
	);
}


export function Tag(props) {
    const { name, color, ...otherProps } = props;

    // return children if name is not provided
    return (
        <div className="tag" style={{ backgroundColor: color }} {...otherProps}>
            {props.children}
        </div>
    );
}