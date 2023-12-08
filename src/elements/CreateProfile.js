import React, { useState, useEffect } from "react";
import {
	Button,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@mui/material"; // Import InputLabel, Select, and MenuItem
import Input from "@mui/material/Input"; // Import Input component separately
import { ErrorTextField } from "./Misc";

var errors = {};
export default function CreateProfile({ onProfileSubmit }) {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [userType, setUserType] = useState("");

	const [disabled, setDisabled] = useState(0);

	useEffect(() => {
		// Check if the user has already created a profile
		const hasProfile = localStorage.getItem("hasProfile");
		if (hasProfile === "true") {
			// User has a profile, navigate to the dashboard
			onProfileSubmit();
		}
	}, [onProfileSubmit]);

	const handleProfileSubmit = () => {
		// You can perform validation here before submitting the profile data
		const profileData = {
			firstName,
			lastName,
			username,
			userType,
		};

		// Save in local storage that the user has created a profile
		localStorage.setItem("hasProfile", "true");

		onProfileSubmit(profileData);
	};

	function returnError(id, error) {
		if (error) {
			errors[id] = true;
			// get length of errors object
			setDisabled(Object.keys(errors).length > 0);
		} else {
			// delete errors[id];
			delete errors[id];
			setDisabled(Object.keys(errors).length > 0);
		}
	}

	return (
		<div className="create-profile">
			<h2> Create Your Profile </h2>
			<ErrorTextField
				required
				returnError={returnError}
				minLength={2}
				maxLength={20}
				label="First Name"
				value={firstName}
				onChange={(e) => setFirstName(e.target.value)}
				style={{ marginBottom: "10px" }} // Add margin to create space
			/>
			<ErrorTextField
				required
				returnError={returnError}
				minLength={2}
				maxLength={20}
				label="Last Name"
				value={lastName}
				onChange={(e) => setLastName(e.target.value)}
				style={{ marginBottom: "10px" }} // Add margin to create space
			/>
			<ErrorTextField
				required
				returnError={returnError}
				minLength={2}
				alphaNumeric
				maxLength={20}
				label="Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				style={{ marginBottom: "15px" }} // Add margin to create space
			/>
			<FormControl style={{ marginBottom: "10px" }}>
				{" "}
				{/* Add margin to create space */}
				<InputLabel shrink> User Type </InputLabel>
				<Select
					required
					value={userType}
					onChange={(e) => setUserType(e.target.value)}
					input={<Input style={{ width: "200px" }} />}
				>
					<MenuItem value="student">Student</MenuItem>
					<MenuItem value="teacher">Teacher</MenuItem>
					<MenuItem value="professional">Professional</MenuItem>
					<MenuItem value="other">Other</MenuItem>
				</Select>
			</FormControl>
			<div style={{ margin: "20px 0" }} />
			<div style={{ display: "flex", justifyContent: "center" }}>
				<Button
					variant="contained"
					onClick={handleProfileSubmit}
					disabled={disabled != 0 || userType == ""}
				>
					Submit Profile
				</Button>
			</div>
		</div>
	);
}
