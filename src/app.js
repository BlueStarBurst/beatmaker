import React, {
	useRef,
	useState,
	useEffect,
	useCallback,
	useLayoutEffect,
	Suspense,
} from "react";
import { render } from "react-dom";

import { Chord, Interval, Note, Scale } from "tonal";
import * as Tone from "tone";

import "./style.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import CssBaseline from "@mui/material/CssBaseline";
import {
	Button,
	Table,
	TableRow,
	ThemeProvider,
	createTheme,
} from "@mui/material";

const darkTheme = createTheme({
	palette: {
		mode: "dark",
	},
});

const lightTheme = createTheme({
	palette: {
		mode: "light",
	},
});

var notes = [];
for (var i = 2; i < 6; i++) {
	notes.push("C" + i);
	notes.push("C#" + i);
	notes.push("D" + i);
	notes.push("D#" + i);
	notes.push("E" + i);
	notes.push("F" + i);
	notes.push("F#" + i);
	notes.push("G" + i);
	notes.push("G#" + i);
	notes.push("A" + i);
	notes.push("A#" + i);
	notes.push("B" + i);
}

const synth = new Tone.PolySynth(Tone.Synth).toDestination();
const now = Tone.now();
synth.triggerAttack("D4", now);
synth.triggerAttack("F4", now + 0.125);
synth.triggerAttack("A4", now + 0.25);
synth.triggerAttack("C5", now + 0.375);
synth.triggerAttack("E5", now + 0.5);
synth.triggerRelease(["D4", "F4", "A4", "C5", "E5"], now + 1);

function App(props) {
	const [theme, setTheme] = useState(darkTheme);
	const [isMouseDown, setIsMouseDown] = useState(false);
	const [isHovering, setIsHovering] = useState(false);

	const [selectedNotes, setSelectedNotes] = useState([]);

	useEffect(() => {
		document.addEventListener("mousedown", (event) => {
			console.log("mousedown");
			setIsMouseDown(true);
		});

		document.addEventListener("mouseup", (event) => {
			console.log("mouseup");
			setIsMouseDown(false);
		});
	}, []);

	function playNote(e, note) {
		var sNotes = selectedNotes;
		// if in list, remove
		if (sNotes.includes(note)) {
			sNotes.splice(sNotes.indexOf(note), 1);
		} else {
			sNotes.push(note);
		}

		for (var i = 0; i < sNotes.length; i++) {
			var now = Tone.now();
			synth.triggerAttack(sNotes[i], now);
			synth.triggerRelease([sNotes[i]], now + 1);
		}


		setSelectedNotes(sNotes);
		setRefresh(!refresh);
		console.log(selectedNotes);

		// const now = Tone.now();
		// synth.triggerAttack(note, now);
		// synth.triggerRelease([note], now + 1);

		// note = note.replace("#", "s");
		
	}

	function hoverTable(e, note) {}

	const [refresh, setRefresh] = useState(true);
	useEffect(() => {
		setRefresh(!refresh);
	}, [selectedNotes]);

	useEffect(() => {
		setRefresh(true);
	}, [refresh]);

	return (
		<ThemeProvider theme={theme}>
			{/* <CssVarsProvider theme={theme} > */}
			<CssBaseline />

			<div className="flex-page">
				<div className="flex-row">
					<div className="flex-col">
						<div
							className="flex-table"
							onMouseEnter={(e) => {
								setIsHovering(true);
							}}
							onMouseLeave={(e) => {
								setIsHovering(false);
							}}
						>
							{notes.map((note) => {
								var keyType = selectedNotes.includes(note)
									? "skey"
									: "key";
								console.log(keyType);

								return (
									<>
										{refresh ? (
											<div className="flex-row">
												<div
													key={note}
													className={
														keyType +
														(note.includes("#") ? " black-key" : " white-key")
													}
													variant="contained"
													color="primary"
													onMouseOver={(e) => {
														if (isMouseDown) {
															playNote(e, note);
														}
													}}
													onClick={(e) => {
														playNote(e, note);
													}}
												>
													<Button fullWidth>{note}</Button>
												</div>
											</div>
										) : (
											<div className="flex-row">
												<div
													key={note}
													className={
														keyType +
														(note.includes("#") ? " black-key" : " white-key")
													}
													variant="contained"
													color="primary"
													onMouseOver={(e) => {
														if (isMouseDown) {
															playNote(e, note);
														}
													}}
													onClick={(e) => {
														playNote(e, note);
													}}
												>
													<Button fullWidth>{note}</Button>
												</div>
											</div>
										)}
									</>
								);
							})}
						</div>
					</div>

					<div className="flex-col">
						<div className="flex-table">
							{notes.map((note) => {
								return (
									<>
										<>
											<div
												className={
													"note-row " +
													(note.includes("#") ? "sharp " : "") +
													(isHovering ? "hover" : "")
												}
												key={note}
											></div>
										</>
									</>
								);
							})}
						</div>
					</div>

					{/* <div className="space"></div> */}
				</div>
			</div>
			{/* </CssVarsProvider> */}
		</ThemeProvider>
	);
}

render(<App />, document.getElementById("root"));

document.addEventListener("dragover", (event) => {
	event.preventDefault();
});
