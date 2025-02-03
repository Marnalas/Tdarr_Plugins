"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var fs_1 = require("fs");
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Delete File',
    description: "\n  Delete the working file or original file.\n  You don't need to use this plugin to clean up files in the cache, Tdarr will do this automatically after the flow.\n  To manually clear the cache, use the 'Clear Cache' flow plugin.\n  ",
    style: {
        borderColor: 'red',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faTrash',
    inputs: [
        {
            label: 'File To Delete',
            name: 'fileToDelete',
            type: 'string',
            defaultValue: 'workingFile',
            inputUI: {
                type: 'dropdown',
                options: [
                    'workingFile',
                    'originalFile',
                ],
            },
            tooltip: 'Specify the file to delete',
        },
        {
            label: 'Delete Working File If It\'s The Original File',
            name: 'deleteWorkingFileIfOriginal',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'fileToDelete',
                                    value: 'workingFile',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'If the option above is set to delete the working file,'
                + ' and the working file is the original file, delete the file.',
        },
        {
            label: 'Delete Parent Folder If Empty',
            name: 'deleteParentFolderIfEmpty',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'If the folder that the file is in is empty after the file is deleted, delete the folder.',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, fileToDelete, _a, deleteParentFolderIfEmpty, deleteWorkingFileIfOriginal, workingFileIsOriginal, fileDir, files;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                fileToDelete = String(args.inputs.fileToDelete);
                _a = args.inputs, deleteParentFolderIfEmpty = _a.deleteParentFolderIfEmpty, deleteWorkingFileIfOriginal = _a.deleteWorkingFileIfOriginal;
                if (!(fileToDelete === 'workingFile')) return [3 /*break*/, 4];
                workingFileIsOriginal = args.originalLibraryFile._id === args.inputFileObj._id;
                if (workingFileIsOriginal) {
                    args.jobLog('Working file is the original file!');
                }
                else {
                    args.jobLog('Working file is not the original file!');
                }
                if (!((workingFileIsOriginal && deleteWorkingFileIfOriginal)
                    || !workingFileIsOriginal)) return [3 /*break*/, 2];
                args.jobLog("Deleting working file ".concat(args.inputFileObj._id));
                return [4 /*yield*/, fs_1.promises.unlink(args.inputFileObj._id)];
            case 1:
                _b.sent();
                return [3 /*break*/, 3];
            case 2:
                args.jobLog('Skipping delete of working file because it is the original file');
                _b.label = 3;
            case 3: return [3 /*break*/, 6];
            case 4:
                if (!(fileToDelete === 'originalFile')) return [3 /*break*/, 6];
                args.jobLog("Deleting original file ".concat(args.originalLibraryFile._id));
                return [4 /*yield*/, fs_1.promises.unlink(args.originalLibraryFile._id)];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6:
                fileDir = (0, fileUtils_1.getFileAbosluteDir)(args.originalLibraryFile._id);
                if (!deleteParentFolderIfEmpty) return [3 /*break*/, 11];
                args.jobLog("Checking if folder ".concat(fileDir, " is empty"));
                return [4 /*yield*/, fs_1.promises.readdir(fileDir)];
            case 7:
                files = _b.sent();
                if (!(files.length === 0)) return [3 /*break*/, 9];
                args.jobLog("Deleting empty folder ".concat(fileDir));
                return [4 /*yield*/, fs_1.promises.rmdir(fileDir)];
            case 8:
                _b.sent();
                return [3 /*break*/, 10];
            case 9:
                args.jobLog("Folder ".concat(fileDir, " is not empty, skipping delete"));
                _b.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                args.jobLog("Skipping delete of parent folder ".concat(fileDir));
                _b.label = 12;
            case 12: return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 1,
                    variables: args.variables,
                }];
        }
    });
}); };
exports.plugin = plugin;
