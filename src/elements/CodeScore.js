import {
    Button,
    Modal,
    Select,
    TableCell,
    TableRow,
    TextField,
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import DBManager from "./DBManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

// BRYANT HARGREAVES
export class BugReportData {
    constructor(name, description, priority, date, id = 0) {
        // id is optional
        this.name = name; // name of the bug report
        this.description = description; // description of the bug report
        this.priority = priority; // priority of the bug report
        this.date = date; // date of the bug report
        this.id = DBManager.instance.getBugReportID(); // unique id of the bug report
        this.customMetrics = []; // Array to store custom metrics
        this.deadline = null; // Add a deadline property
    }

    static fromJSON(json) {
        // Used for loading from local storage
        return new BugReportData(
            json.name,
            json.description,
            json.priority,
            json.date,
            json.id
        );
    }

    toJSON() {
        // Used for saving to local storage
        return {
            name: this.name,
            description: this.description,
            priority: this.priority,
            date: this.date,
            id: this.id,
        };
    }

    addCustomMetric(name, description, type) {
        this.customMetrics.push(new CustomMetric(name, description, type));
    }

    updateCustomMetric(index, name, description, type) {
        const metric = this.customMetrics[index];
        if (metric) {
            metric.name = name;
            metric.description = description;
            metric.type = type;
        }
    }

    deleteCustomMetric(index) {
        this.customMetrics.splice(index, 1);
    }

    download() {
        // Used for downloading the bug report
        var dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(this.toJSON()));
        var downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", this.name + ".report");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    static upload(onFinish) {
        // Used for uploading the bug report
        var input = document.createElement("input");
        input.type = "file";
        input.accept = ".report";
        input.onchange = (e) => {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = (e) => {
                var contents = e.target.result;
                var json = JSON.parse(contents);
                var report = BugReportData.fromJSON(json);
                DBManager.getInstance().createBugReport(
                    report.name,
                    report.description,
                    report.priority,
                    report.date
                );
                DBManager.getInstance().autoSave();
                onFinish();
            };
            reader.readAsText(file);
        };
        input.click();
    }

    setDeadline(date) {
        this.deadline = date;
    }
}

// BRYANT HARGREAVES
export function FakeBugReport(props) {
    const ref = useRef(null);
    const [close, setClose] = useState(false);

    useEffect(() => {
        if (props.mouseCol == props.col) {
            setClose(false);
            return;
        }
        if (!props.dragging) {
            if (close) {
                props.moveBR(props.col);
            }
            setClose(false);
            return;
        }

        console.log(props.mousePos);
        if (props.dragging && props.mousePos) {
            var left =
                ref.current.getBoundingClientRect().left + ref.current.offsetWidth / 2;
            var top =
                ref.current.getBoundingClientRect().top + ref.current.offsetHeight;
            // if pos is within 150px of mousePos, set close to true
            var dist = Math.sqrt(
                Math.pow(props.mousePos.x - left, 2) +
                Math.pow(props.mousePos.y - top, 2)
            );

            if (dist < 100) {
                console.log("CLOSE");
                setClose(true);
            } else {
                setClose(false);
            }
        }
    }, [props.mousePos, props.dragging, props.mouseCol]);

    return (
        <TableRow ref={ref}>
            <div className={close ? "fakeClose" : "fakeFar"}></div>
        </TableRow>
    );
}


// BRYANT HARGREAVES
export default function BugReport(props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("");
    const [date, setDate] = useState("");
    const [id, setId] = useState(0);
    const [deadline, setDeadline] = useState("");

    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const [isDragging, setIsDragging] = useState(false);

    const drag = useRef(null);
    const orig = useRef(null);

    useEffect(() => {
        // set the height and width variables using the original element
        // this is so that the element doesn't change size when it is being dragged
        if (orig.current == null) return;
        setHeight(orig.current.offsetHeight);
        setWidth(orig.current.offsetWidth);
        console.log("set height and width");
        console.log(orig.current.offsetHeight);
        console.log(orig.current.offsetWidth);
    }, [orig.current]);

    useEffect(() => {
        // set the name, description, priority, and date variables
        // this is so that the element can display the correct information
        // and change when the bug report is updated
        var bugRep = props.bugRep;
        setName(bugRep.name);
        setDescription(bugRep.description);
        setPriority(bugRep.priority);
        setDate(new Date(bugRep.date).toDateString());
        setId(bugRep.id);
    }, [props.bugRep]);

    useEffect(() => {
        if (isDragging) {
            // if the element is being dragged, set the position and size of the element to the mouse position
            drag.current.style.width = width + "px";
            drag.current.style.height = height + "px";
            drag.current.style.left =
                startPos.x - drag.current.offsetWidth / 2 + "px";
            drag.current.style.top =
                startPos.y - drag.current.offsetHeight / 2 + "px";
        } else if (width != 0 && height != 0) {
            // otherwise fix the width and height of the element
            orig.current.style.width = width + "px !important";
            orig.current.style.height = height + "px !important";
            console.log("set orig");
        }
    }, [isDragging]);

    function detectLeftButton(event) {
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
            return false;
        } else if ("buttons" in event) {
            return event.buttons === 1;
        } else if ("which" in event) {
            return event.which === 1;
        } else {
            return event.button == 1 || event.type == "click";
        }
    }
    // when the user starts dragging the element, set the start position and set isDragging to true
    function startDrag(e) {
        // make sure target is not custom edit button
        if (e.target.id == "custom") return;
        if (e.currentTarget.id == "custom") return;
        console.log(e.target);
        console.log(e.currentTarget);

        if (detectLeftButton(e) == false) return;
        e.preventDefault();
        setIsDragging(true);
        props.setBugId(id);
        props.setDragging(true);
        props.setMouseCol(props.col);
        setStartPos({ x: e.clientX, y: e.clientY });
    }

    // when the user stops dragging the element, set isDragging to false
    function endDrag() {
        if (isDragging) {
            drag.current.style.width = width + "px !important";
            drag.current.style.height = height + "px !important";
            setIsDragging(false);
            props.setDragging(false);
        }
        console.log("end drag");
    }

    const [close, setClose] = useState(false);

    // when the user moves the mouse, update the position of the element
    function mouseMove(e) {
        e.preventDefault();
        e.stopPropagation();
        if (isDragging) {
            console.log("dragging");
            drag.current.style.left = e.clientX - drag.current.offsetWidth / 2 + "px";
            drag.current.style.top = e.clientY - drag.current.offsetHeight / 2 + "px";
            props.setMousePos({ x: e.clientX, y: e.clientY });
            var dist = Math.sqrt(
                Math.pow(e.clientX - startPos.x, 2) +
                Math.pow(e.clientY - startPos.y, 2)
            );
            if (dist < 150) {
                setClose(true);
            } else {
                setClose(false);
            }
        }
    }

    function edit(e) {
        e.preventDefault();
        e.stopPropagation();
        props.setEditingId(id);
    }

    <div className="trueReport report" unselectable="true" ref={orig}>
        <div className="flex-bug-head">
            <h5>{name}</h5>
            <p onClick={edit} id="custom" className="edit">
                <FontAwesomeIcon onClick={edit} id="custom" icon={faPencil} />
            </p>
        </div>
        <p>{description}</p>
        <p>{priority == 30 ? "High" : priority == 20 ? "Med" : "Low"}</p>
        {deadline && <span className="deadline-tag">Deadline: {deadline}</span>}
        <p>{date}</p>
    </div>

    return (
        <TableRow
            // onMouseDown={startDrag}
            onMouseUp={endDrag}
            onMouseDown={startDrag}
            onMouseMove={mouseMove}
            onMouseLeave={endDrag}
            className={close || !isDragging ? "close" : "far"}
        >
            <TableCell>
                {isDragging ? (
                    <>
                        <div className="absReport report" ref={drag}>
                            <div className="flex-bug-head">
                                <h5>{name}</h5>
                                <p>edit</p>
                            </div>

                            <p>{description}</p>
                            <p>{priority == 30 ? "High" : priority == 20 ? "Med" : "Low"}</p>
                            <p>{date}</p>
                        </div>
                        <div className={close ? "otherReport report" : "fakeReport report"}>
                            <div className="flex-bug-head">
                                <h5>{name}</h5>
                                <p>edit</p>
                            </div>
                            <p>{description}</p>
                            <p>{priority == 30 ? "High" : priority == 20 ? "Med" : "Low"}</p>
                            <p>{date}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="trueReport report" unselectable="true" ref={orig}>
                            <div className="flex-bug-head">
                                <h5>{name}</h5>
                                <p onClick={edit} id="custom" className="edit">
                                    <FontAwesomeIcon onClick={edit} id="custom" icon={faPencil} />
                                </p>
                            </div>
                            <p>{description}</p>
                            <p>{priority == 30 ? "High" : priority == 20 ? "Med" : "Low"}</p>
                            <p>{date}</p>
                        </div>
                    </>
                )}
            </TableCell>
        </TableRow>
    );
}

// BRYANT HARGREAVES
export function CreateBugReportModal(props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("");
    const [deadline, setDeadline] = useState("");

    // when the user clicks the submit button, create the bug report
    function createReport() {
        if (props.editingId != -1) {
            DBManager.getInstance().editBugReport(
                props.editingId,
                name,
                description,
                priority,
                date
            );
            DBManager.getInstance().autoSave();
            props.handleClose();
            return;
        }

        var date = new Date();
        var report = new BugReportData(name, description, priority, date);

        DBManager.getInstance().createBugReport(name, description, priority);
        DBManager.getInstance().autoSave();
        console.log(report);
        props.handleClose();
    }

    // when the user clicks the delete button, delete the bug report
    function deleteReport() {
        DBManager.getInstance().deleteBugReport(props.editingId);
        DBManager.getInstance().autoSave();
        props.handleClose();
    }

    // when the user clicks the download button, download the bug report
    function downloadReport() {
        var date = new Date();
        var br = new BugReportData(name, description, priority, date);
        br.download();
    }

    useEffect(() => {
        // when editingId is -1, the user is creating a new bug report
        if (props.editingId == -1) {
            setName("");
            setDescription("");
            setPriority(10);
            return;
        }

        // otherwise, the user is editing an existing bug report
        // so we need to set the name, description, and priority to the values of the bug report
        console.log("editing");
        var report = DBManager.getInstance().getBugReport(props.editingId);
        console.log(report);
        setName(report.name);
        setDescription(report.description);
        setPriority(report.priority);
    }, [props.editingId]);

    <TextField
        id="outlined-basic"
        label="Deadline"
        type="date"
        variant="outlined"
        onChange={(e) => {
            setDeadline(e.target.value);
        }}
        value={deadline}
    />

    return (
        <Modal open={props.open} onClose={props.handleClose}>
            <div className="bugModal">
                <h1>Report</h1>
                <p>Name</p>
                <TextField
                    id="outlined-basic"
                    label="Name"
                    variant="outlined"
                    autoComplete="off"
                    autoCorrect="off"
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                    value={name}
                />
                <p>Description</p>
                <TextField
                    id="outlined-multiline-static"
                    multiline
                    rows={4}
                    label="Description"
                    variant="outlined"
                    onChange={(e) => {
                        setDescription(e.target.value);
                    }}
                    value={description}
                />
                <p>Priority</p>
                <Select
                    native
                    value={priority}
                    onChange={(e) => {
                        setPriority(e.target.value);
                    }}
                >
                    <option value={10}>Low</option>
                    <option value={20}>Medium</option>
                    <option value={30}>High</option>
                </Select>
                <br />
                <div className="flex-row">
                    <Button onClick={createReport} variant="contained">
                        Submit
                    </Button>
                    <Button onClick={downloadReport} variant="contained" color="warning">
                        Download
                    </Button>
                    {props.editingId == -1 ? null : (
                        <Button onClick={deleteReport} variant="contained" color="error">
                            Delete
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}

//Mulham Ahmed
function calculateScore(bugReports) {
    let score = 100; // Starting score
    score -= bugReports.length * 5; // Deduct 5 points per bug
    return score;
}

const [score, setScore] = useState(100);

useEffect(() => {
    // Fetch the number of bugs and update the score
    async function fetchBugs() {
        const response = await axios.get('/api/bugs');
        setScore(calculateScore(response.data));
    }
    fetchBugs();
}, []);


app.get('/bug-summary', async (req, res) => {
    const openBugs = await BugReport.countDocuments({ status: 'open' });
    const closedBugs = await BugReport.countDocuments({ status: 'closed' });
    res.json({ openBugs, closedBugs });
});
function BugSummary() {
    const [summary, setSummary] = useState({ openBugs: 0, closedBugs: 0 });

    useEffect(() => {
        async function fetchSummary() {
            const response = await axios.get('/bug-summary');
            setSummary(response.data);
        }
        fetchSummary();
    }, []);

    return (
        <div>
            <p>Open Bugs: {summary.openBugs}</p>
            <p>Closed Bugs: {summary.closedBugs}</p>
        </div>
    );
}



