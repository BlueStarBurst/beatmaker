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

const notes = [
	"C4",
	"C#4",
	"D4",
	"D#4",
	"E4",
	"F4",
	"F#4",
	"G4",
	"G#4",
	"A4",
	"A#4",
	"B4",
	"C5",
	"C#5",
	"D5",
	"D#5",
	"E5",
];

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
		const now = Tone.now();
		synth.triggerAttack(note, now);
		synth.triggerRelease([note], now + 1);
	}

	return (
		<ThemeProvider theme={theme}>
			{/* <CssVarsProvider theme={theme} > */}
			<CssBaseline />
			<div className="flex-page">
				<div className="flex-row">
					<div className="flex-col">
						<div className="flex-table">
							{notes.map((note) => (
								<div
									className={note.includes("#") ? "black-key" : "white-key"}
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
									<Button fullWidth sx={{}}>
										{note}
									</Button>
								</div>
							))}
						</div>
					</div>
					<div className="space"></div>
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
