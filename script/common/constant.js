var CONSTANT = {
	ACTION: {
		ADD: 'A',
		UPDATE: 'U',
		DELETE: 'D',
		INQUIRY: 'I',
		CANCEL: 'C',
		SAVE: 'S',
		SEND: 'N',
		SEARCH: 'R',
		STOP: 'T',
		NOTIFY: 'F',
		ERROR: 'E',
		LOAD: 'L',
		UPLOAD: 'O',
		APPROVE: 'V',
		DOWNLOAD: 'W',
		EXPORT: 'X',
		IMPORT: 'M',
		GENERATE: 'G',
		COPY: 'Y', 
		REJECT: 'J',
		CONFIRM: 'M',
		BACK_TO_LIST: 'K'
	},
	STATE: {
		UPDATED: '1',
		ORIGINAL: '0'
	},
	COMMON: {
		YES: 'Y',
		NO: 'N'
	},
	/*
	APPLY_STATUS: {
		CREATED: '0',
		SENT: '1',
		REJECTED: '2',
		ACCEPTED: '3',
		ESTABLISHED: '4'
	},
	NOTICE_STATUS: {
		CREATED: '0',
		SENT: '3',
		CONFIRMED: '6'
	},
	*/
	TYPE: {
		UNDEFINED: 'undefined', 
		OBJECT: 'object',
		FUNCTION: 'function',
		STRING: 'string'
	},
	/*
	LABEL: {
		NONE: '無',
		SELECT: '請選擇'
	},
	*/
	SECURITY: {
		HEADER: {
			NAME: 'X-CSRF-HEADER',
			TOKEN: 'X-CSRF-TOKEN',
			SESSION: 'USER-SESSION'
		},
		ROLE: {
			ADMIN: 'ADMIN',
			SUPERVISOR: 'SUPERVISOR',
			OPERATOR: 'OPERATOR',
			USER: 'USER',
			CLIENT: 'CLIENT'
		}
	},
	DATASOURCE: {
		DEFAULT: 0,
		SERVER: 1,
		CLIENT: 2
	},
	ORGANIZATION: {
		HEAD_OFFICE: "1", 
		DISTRICT: "2", 
		SERVICE_OFFICE: "3", 
		CUSTOMER: "4" 
	},
	OPERATE: {
		QUERY: 'Q',
		INSERT: 'I',
		UPDATE: 'U',
		DELETE: 'D',
		UPLOAD: 'UL',
		XLS: 'X',
		CSV: 'C',
		ODS: 'O',
		LOGIN: 'LI',
		LOGOUT: 'LO'
	},
	SENSOR: {
		TYPE: {
			FLOWMETER: '0101', 
			WATER_LEVEL_GAUGE: '5001'
		}
	}
};
