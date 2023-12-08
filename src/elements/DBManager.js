import { Firestore, collection, getFirestore } from "firebase/firestore";
import { db, saveToFireStore } from "./Auth";

import { BugReportData } from "./BugReport";

class DBManager {
	constructor() {
		// use the localstorage to store the data
		this.db = window.localStorage;
		// if ()
		// collection(db, "users/" ).get().then((querySnapshot) => {
		// }
		this.reports = this.getFromStorage("reports") || {};
		this.todo = this.getFromStorage("todo") || {};
		this.inprog = this.getFromStorage("inprog") || {};
		this.done = this.getFromStorage("done") || {};
	}

	static instance = null;

	static getInstance() {
		if (!DBManager.instance) {
			DBManager.instance = new DBManager();
		}
		return DBManager.instance;
	}

    getBugReportID() {
        return Object.keys(this.reports).length;
    }

    moveBugReport(id, col) {
        var br = this.reports[id];
        delete this.todo[id];
        delete this.inprog[id];
        delete this.done[id];
        switch (col) {
            case 0:
                this.todo[id] = br;
                break;
            case 1:
                this.inprog[id] = br;
                break;
            case 2:
                this.done[id] = br;
                break;
            default:
                this.todo[id] = br;
                break;
        }
        console.log(this.inprog);
        this.autoSave();
    }

	editBugReport(id, name, description, priority, tags, date) {
		var br = this.reports[id];
		br.name = name;
		br.description = description;
		br.priority = priority;
		br.tags = tags;
		br.date = date;
		
		if (this.todo[id]) {
			this.todo[id] = br;
		} else if (this.inprog[id]) {
			this.inprog[id] = br;
		} else if (this.done[id]) {
			this.done[id] = br;
		}
		this.reports[id] = br;
		this.autoSave();
	}	

	getFromStorage(key) {
		try {
			return JSON.parse(this.db.getItem(key));
		} catch (e) {
			return null;
		}
	}

	saveToStorage(key, value) {
		this.db.setItem(key, JSON.stringify(value));
	}

	autoSave() {
		this.saveToStorage("todo", this.todo);
		this.saveToStorage("inprog", this.inprog);
		this.saveToStorage("done", this.done);
		this.saveToStorage("reports", this.reports);

		// save to firestore
		saveToFireStore(this.reports, this.todo, this.inprog, this.done);
	}

	createDB() {
		// create the database
		this.reports = {};
		this.todo = {};
		this.inprog = {};
		this.done = {};
	}

	createBugReport(name, description, priority, tags) {
		var date = new Date();
		var br = new BugReportData(name, description, priority, tags, date);
		this.todo[br.id] = br;
		this.reports[br.id] = br;
		this.autoSave();
	}

    deleteBugReport(id) {
        delete this.reports[id];
        delete this.todo[id];
        delete this.inprog[id];
        delete this.done[id];
        this.autoSave();
    }

	getBugReport(id) {
		return this.reports[id];
	}

	getBugReports(sort = 0) {
		// 0/1 is by date asc/desc, 2/3 is by priority asc/desc, 4/5 is by name asc/desc
		var sortedR = [];
		var sortedT = [];
		var sortedI = [];
		var sortedD = [];
		switch (sort) {
			case 0:
				sortedR = Object.values(this.reports).sort((a, b) => a.date - b.date);
				sortedT = Object.values(this.todo).sort((a, b) => a.date - b.date);
				sortedI = Object.values(this.inprog).sort((a, b) => a.date - b.date);
				sortedD = Object.values(this.done).sort((a, b) => a.date - b.date);
				break;
			case 1:
				sortedR = Object.values(this.reports).sort((a, b) => b.date - a.date);
				sortedT = Object.values(this.todo).sort((a, b) => b.date - a.date);
				sortedI = Object.values(this.inprog).sort((a, b) => b.date - a.date);
				sortedD = Object.values(this.done).sort((a, b) => b.date - a.date);
				break;
			case 2:
				sortedR = Object.values(this.reports).sort(
					(a, b) => a.priority - b.priority
				);
				sortedT = Object.values(this.todo).sort(
					(a, b) => a.priority - b.priority
				);
				sortedI = Object.values(this.inprog).sort(
					(a, b) => a.priority - b.priority
				);
				sortedD = Object.values(this.done).sort(
					(a, b) => a.priority - b.priority
				);
				break;
			case 3:
				sortedR = Object.values(this.reports).sort(
					(a, b) => b.priority - a.priority
				);
				sortedT = Object.values(this.todo).sort(
					(a, b) => b.priority - a.priority
				);
				sortedI = Object.values(this.inprog).sort(
					(a, b) => b.priority - a.priority
				);
				sortedD = Object.values(this.done).sort(
					(a, b) => b.priority - a.priority
				);
				break;
			case 4:
				sortedR = Object.values(this.reports).sort((a, b) =>
					a.name.localeCompare(b.name)
				);
				sortedT = Object.values(this.todo).sort((a, b) =>
					a.name.localeCompare(b.name)
				);
				sortedI = Object.values(this.inprog).sort((a, b) =>
					a.name.localeCompare(b.name)
				);
				sortedD = Object.values(this.done).sort((a, b) =>
					a.name.localeCompare(b.name)
				);
				break;
			case 5:
				sortedR = Object.values(this.reports).sort((a, b) =>
					b.name.localeCompare(a.name)
				);
				sortedT = Object.values(this.todo).sort((a, b) =>
					b.name.localeCompare(a.name)
				);
				sortedI = Object.values(this.inprog).sort((a, b) =>
					b.name.localeCompare(a.name)
				);
				sortedD = Object.values(this.done).sort((a, b) =>
					b.name.localeCompare(a.name)
				);
				break;
			default:
				sortedR = Object.values(this.reports).sort((a, b) => a.date - b.date);
				sortedT = Object.values(this.todo).sort((a, b) => a.date - b.date);
				sortedI = Object.values(this.inprog).sort((a, b) => a.date - b.date);
				sortedD = Object.values(this.done).sort((a, b) => a.date - b.date);
				break;
		}
		return [sortedR, sortedT, sortedI, sortedD];
	}

    clearTable() {
        this.reports = {};
        this.todo = {};
        this.inprog = {};
        this.done = {};
        this.autoSave();
    }

	saveProfile(profile) {
		this.profile = profile;
		this.saveToStorage("profile", profile);
		this.autoSave();
	}

	getProfile() {
		if (this.profile) {
			return this.profile;
		} else {
			return this.getFromStorage("profile");
		}
	}



}

DBManager.instance = new DBManager();

export default DBManager;
