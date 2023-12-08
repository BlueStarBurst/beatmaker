import {
	Box,
	Button,
	ButtonGroup,
	Chip,
	FormControl,
	InputLabel,
	MenuItem,
	Modal,
	OutlinedInput,
	Paper,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { logOut } from "./Auth";
import BugReport, {
	BugReportData,
	CreateBugReportModal,
	FakeBugReport,
} from "./BugReport";
import DBManager from "./DBManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSortAlphaAsc,
	faSortAmountAsc,
	faSortAmountDesc,
	faSortAsc,
	faSortDesc,
} from "@fortawesome/free-solid-svg-icons";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

var tableTimeout = null;
export default function Dashboard(props) {
	const [open, setOpen] = useState(false);
	const [rows, setRows] = useState(0);

	const [todo, setTodo] = useState([]);
	const [inProgress, setInProgress] = useState([]);
	const [completed, setCompleted] = useState([]);
	const [tags, setTags] = useState([]);

	const [sortMethod, setSortMethod] = useState(0);
	const [asc, setAsc] = useState(1);
	const [editingId, setEditingId] = useState(-1);

	const t1 = useRef(null);
	const t2 = useRef(null);
	const t3 = useRef(null);

	const [refreshing, setRefreshing] = useState(false);
	function handleClose() {
		setTodo([]);
		setInProgress([]);
		setCompleted([]);
		setOpen(false);
		setEditingId(-1);
		setRefreshing(true);
	}

	useEffect(() => {
		if (refreshing) {
			refresh(sortMethod);
			setRefreshing(false);
		}
	}, [refreshing]);


	useEffect(() => {
		refresh(sortMethod);
	}, [asc]);

	function refresh(method = 0) {
		setSortMethod(method);
		method += asc;
		var reportList = DBManager.instance.getBugReports(method);
		var todo = reportList[1];
		var inprog = reportList[2];
		var done = reportList[3];

		if (tags.length == 0) {
			setTodo(todo);
			setInProgress(inprog);
			setCompleted(done);

			setRows(
				Math.max(todo.length, inprog.length, done.length)
			);
			var rowList = [...Array(rows)].map((row, i) => i);
			console.log(rowList);
		} else {
			var todoFiltered = todo.filter((br) => {
				for (var i = 0; i < tags.length; i++) {
					if (br.tags.includes(tags[i])) {
						return true;
					}
				}
				return false;
			});

			var inprogFiltered = inprog.filter((br) => {
				for (var i = 0; i < tags.length; i++) {
					if (br.tags.includes(tags[i])) {
						return true;
					}
				}
				return false;
			});

			var doneFiltered = done.filter((br) => {
				for (var i = 0; i < tags.length; i++) {
					if (br.tags.includes(tags[i])) {
						return true;
					}
				}
				return false;
			});

			setTodo(todoFiltered);
			setInProgress(inprogFiltered);
			setCompleted(doneFiltered);

			setRows(
				Math.max(todoFiltered.length, inprogFiltered.length, doneFiltered.length)
			);
			var rowList = [...Array(rows)].map((row, i) => i);
			console.log(rowList);
			
		}

		

		

		if (t1.current) t1.current.style.height = "100%";
		if (t2.current) t2.current.style.height = "100%";
		if (t3.current) t3.current.style.height = "100%";
		clearTimeout(tableTimeout);
		tableTimeout = setTimeout(() => {
			// find the max height of the 3 tables
			var max = 0;
			if (t1.current && t2.current && t3.current) {
				max = Math.max(
					t1.current.clientHeight,
					t2.current.clientHeight,
					t3.current.clientHeight
				);
			}
			// set the height of the 3 tables to the max height
			if (t1.current) t1.current.style.height = max + "px";
			if (t2.current) t2.current.style.height = max + "px";
			if (t3.current) t3.current.style.height = max + "px";
		}, 100);
	}

	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);
	const [mouseCol, setMouseCol] = useState(0);
	const [bugId, setBugId] = useState(0);
	const [selectedReport, setSelectedReport] = useState(null);

	function moveBR(col) {
		DBManager.instance.moveBugReport(bugId, col);
		console.log("moved to " + col + " " + bugId);
		refresh(sortMethod);
	}

	useEffect(() => {
		if (editingId == -1) return;
		setOpen(true);
	}, [editingId]);

	useEffect(() => {
		refresh(sortMethod);
	}, [tags]);

	return (
		<>
			{/* <br /> */}

			<CreateBugReportModal
				open={open}
				handleClose={handleClose}
				editingId={editingId}
			/>

			<div className="flex-row">
				<h1 style={{ margin: 0 }}>Dashboard</h1>
				{/* <Button variant="contained" onClick={() => refresh(2)}>
					Sort by Priority (Low to High)
				</Button>
				<Button variant="contained" onClick={() => refresh(3)}>
					Sort by Priority (High to Low)
				</Button> */}
				<FormControl sx={{ m: 1, minWidth: 300 }}>
					<InputLabel id="demo-multiple-chip-label">Filter</InputLabel>
					<Select
						multiple
						value={tags}
						onChange={(e) => {
							console.log(e.target.value);
							setTags(e.target.value);
						}}
						sx={{ padding: "0 10px !important" }}
						input={<OutlinedInput label={"Filter"} />}
						MenuProps={MenuProps}
						renderValue={(selected) => (
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
								{selected.map((value) => (
									<Chip key={value} label={value} />
								))}
							</Box>
						)}
					>
						{[
							"Front-End",
							"Back-End",
							"Cloud",
							"Unknown",
							"Suggestion",
							"Critical",
						].map((name) => (
							<MenuItem key={name} value={name}>
								{name}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<ButtonGroup
					variant="outlined"
					aria-label="outlined primary button group"
				>
					<FormControl
						sx={{
							m: 0,
							minWidth: 120,
							color: "lightblue !important",
							borderColor: "lightblue !important",
							outlineColor: "lightblue !important",
						}}
						// size="small"
						variant="outlined"
						color="primary"
						className="MuiButton-outlinedPrimary"
					>
						<InputLabel id="demo-select-small-label">Sort</InputLabel>
						<Select
							variant="outlined"
							className="MuiButton-outlinedPrimary"
							labelId="demo-simple-select-error-label"
							id="demo-simple-select-error"
							color="primary"
							value={sortMethod}
							label="Age"
							style={{ color: "lightblue !important" }}
							onChange={(e) => {
								refresh(e.target.value);
							}}
						>
							<MenuItem value={0}>Date</MenuItem>
							<MenuItem value={2}>Priority</MenuItem>
							<MenuItem value={4}>Name</MenuItem>
						</Select>
					</FormControl>
					<Button
						variant="outlined"
						onClick={() => {
							if (asc == 1) {
								setAsc(0);
								// refresh(sortMethod-1);
							} else {
								setAsc(1);
								// refresh(sortMethod+1);
							}
						}}
					>
						<FontAwesomeIcon icon={asc ? faSortAmountAsc : faSortAmountDesc} />
					</Button>
				</ButtonGroup>
			</div>

			<div className="flex-row">
				<Button
					variant="contained"
					onClick={() => {
						setEditingId(-1);
						setOpen(true);
					}}
				>
					Create Report
				</Button>
				<Button
					variant="contained"
					onClick={() => {
						BugReportData.upload(() => {
							refresh(sortMethod);
						});
						// refresh(sortMethod);
					}}
				>
					Upload
				</Button>
				<Button
					variant="contained"
					color="warning"
					onClick={() => {
						DBManager.instance.clearTable();
						refresh(sortMethod);
					}}
				>
					Clear Table
				</Button>
				<Button
					variant="contained"
					color="error"
					onClick={logOut}
					disabled={false}
				>
					Sign out
				</Button>
			</div>
			{/* <br /> */}

			<TableContainer component={Paper} className="bugTable">
				<Table stickyHeader ref={t1}>
					<TableHead sx={{ backgroundColor: "#000000" }}>
						<TableRow>
							<TableCell>To-Do</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{todo.map((br, i) => (
							<React.Fragment key={br.id}>
								<FakeBugReport
									col={0}
									mouseCol={mouseCol}
									dragging={dragging}
									mousePos={mousePos}
									moveBR={moveBR}
								/>
								<BugReport
									col={0}
									setMouseCol={setMouseCol}
									setDragging={setDragging}
									setMousePos={setMousePos}
									bugRep={br}
									setBugId={setBugId}
									setEditingId={setEditingId}
									setSelectedReport={setSelectedReport}
									selectedReport={selectedReport}
								/>
							</React.Fragment>
						))}
						<FakeBugReport
							full
							col={0}
							mouseCol={mouseCol}
							dragging={dragging}
							mousePos={mousePos}
							moveBR={moveBR}
						/>
					</TableBody>
				</Table>
				<Table stickyHeader ref={t2}>
					<TableHead sx={{ backgroundColor: "#000000" }}>
						<TableRow>
							<TableCell>In Progress</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{inProgress.map((br, i) => (
							<React.Fragment key={br.id}>
								<FakeBugReport
									col={1}
									mouseCol={mouseCol}
									dragging={dragging}
									mousePos={mousePos}
									moveBR={moveBR}
								/>
								<BugReport
									col={1}
									setMouseCol={setMouseCol}
									setDragging={setDragging}
									setMousePos={setMousePos}
									bugRep={br}
									setBugId={setBugId}
									setEditingId={setEditingId}
									setSelectedReport={setSelectedReport}
									selectedReport={selectedReport}
								/>
							</React.Fragment>
						))}
						<FakeBugReport
							full
							col={1}
							mouseCol={mouseCol}
							dragging={dragging}
							mousePos={mousePos}
							moveBR={moveBR}
						/>
					</TableBody>
				</Table>
				<Table stickyHeader ref={t3}>
					<TableHead sx={{ backgroundColor: "#000000" }}>
						<TableRow>
							<TableCell>Done</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{completed.map((br, i) => (
							<React.Fragment key={br.id}>
								<FakeBugReport
									col={2}
									mouseCol={mouseCol}
									dragging={dragging}
									mousePos={mousePos}
									moveBR={moveBR}
								/>
								<BugReport
									col={2}
									setMouseCol={setMouseCol}
									setDragging={setDragging}
									setMousePos={setMousePos}
									bugRep={br}
									setBugId={setBugId}
									setEditingId={setEditingId}
									setSelectedReport={setSelectedReport}
									selectedReport={selectedReport}
								/>
							</React.Fragment>
						))}
						<FakeBugReport
							full
							col={2}
							mouseCol={mouseCol}
							dragging={dragging}
							mousePos={mousePos}
							moveBR={moveBR}
						/>
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}
