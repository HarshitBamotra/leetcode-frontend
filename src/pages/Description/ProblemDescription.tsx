
import { useState, DragEvent, useEffect } from 'react';
import AceEditor from 'react-ace';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import "../../imports/AceBuildImports";
import DOMPurify from 'dompurify';

import Languages from '../../constants/Languages';
import Themes from '../../constants/Themes';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

type languageSupport = {
    languageName: string,
    value: string
}

type themeStyle = {
    themeName: string,
    value: string
}

// type serverData = {
//     success: string,
//     message: string,
//     err: object,
//     data: object
// }

function Description({ descriptionText }: {descriptionText: string}) {

    const {id} = useParams();
    const userId = "1"; // Hardcoded for this example
    console.log(id);

    const [problem, setProblem] = useState({});

    

    // const sanitizedMarkdown = DOMPurify.sanitize(descriptionText);


    const [activeTab, setActiveTab] = useState('statement');
    const [testCaseTab, setTestCaseTab] = useState('input');
    const [leftWidth, setLeftWidth] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [language, setLanguage] = useState('c_cpp');
    const [code, setCode] = useState('');
    const [theme, setTheme] = useState('monokai');
    const [sanitizedMarkdown, setSanitizedMarkdown] = useState("");
    const [output, setOutput] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState('');
    const [outputData, setOutputData] = useState<{
        output: string;
        status: string;
    } | null>(null);



    useEffect(() => {
        const socket = io('http://localhost:3004');

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            // Register userId with socket server
            socket.emit('setUserId', userId);
        });

        socket.on('submissionPayloadResponse', (payload: any) => {
            console.log('Received submission response:', payload);
            setOutputData(payload.response);
            // setOutput(payload.output || payload.message || JSON.stringify(payload));
            setSubmissionStatus(payload.response.status);
            setTestCaseTab('output');
            const collapsible = document.getElementById("input-output-collapsible");
            collapsible?.click();
        });

        return () => {
            socket.disconnect();
        };
    }, []);


    useEffect(()=>{
        const fetchData = async ()=>{
            const response = await axios.get(`http://localhost:3001/api/v1/problems/${id}`);
            console.log(response.data.data);
            setProblem(response.data.data);
            setCode(response.data.data.codeStubs[0].userSnippet);
            setSanitizedMarkdown(DOMPurify.sanitize(response.data.data.description));
        }
        fetchData();
    }, []);

    const renderOutput = ()=>{
        if (!outputData) return 'No output yet';

        return (
            <div className="space-y-2">
                <div className={`text-base font-semibold ${
                    outputData.status === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                    Status: {outputData.status}
                </div>
                <div className="mt-2">
                    <div className="text-base font-semibold">Output:</div>
                    <div className="font-mono mt-1 text-white">
                        {outputData.output}
                    </div>
                </div>
            </div>
        );
    }

    async function handleSubmission() {
        try {
            console.log(code)
            console.log(language)
            setSubmissionStatus('Processing');
            setOutput('Evaluating your submission...');
            setTestCaseTab('output');
            const response = await axios.post("http://localhost:3000/api/v1/submissions", {
                code,
                language,
                userId: "1",
                problemId: id
            });
            console.log(response);
            setSubmissionStatus('Evaluating...');
            return response;
        } catch(error) {
            console.error('Submission error:', error);
            setOutput('Error submitting code. Please try again.');
            setSubmissionStatus('Error');
        }
    }

    const startDragging = (e: DragEvent<HTMLDivElement>) => {
        setIsDragging(true);
        e.preventDefault();
    }

    const stopDragging = () => {
        if(isDragging) {
            setIsDragging(false);
        }
    }

    const onDrag = (e: DragEvent<HTMLDivElement>) => {
        if(!isDragging) return;
        
        const newLeftWidth = (e.clientX / window.innerWidth) * 100;
        if(newLeftWidth > 10 && newLeftWidth < 90) {
            setLeftWidth(newLeftWidth);
        }

    }

    const isActiveTab = (tabName: string) => {
        if(activeTab === tabName) {
            return 'tab tab-active';
        } else {
            return 'tab'
        }
    }

    const isInputTabActive = (tabName: string) => {
        if(testCaseTab === tabName) {
            return 'tab tab-active';
        } else {
            return 'tab';
        }
    }



    return (
        <div 
            className='flex w-screen h-[calc(100vh-57px)]'
            onMouseMove={onDrag}
            onMouseUp={stopDragging}
            
        >

            <div className='leftPanel h-full overflow-auto' style={{ width: `${leftWidth}%`}}>

                <div role="tablist" className="tabs tabs-boxed w-3/5">
                    <a onClick={() => setActiveTab('statement')} role="tab" className={isActiveTab("statement")}>Problem Statement</a>
                    <a onClick={() => setActiveTab('editorial')} role="tab" className={isActiveTab("editorial")}>Editorial</a>
                    <a onClick={() => setActiveTab('submissions')} role="tab" className={isActiveTab("submissions")}>Submissions</a>
                </div>

                <div className='markdownViewer p-[20px] basis-1/2'>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} className="prose">
                        {sanitizedMarkdown}
                    </ReactMarkdown>
                </div>


            </div>

            <div className='divider cursor-col-resize w-[5px] bg-slate-200 h-full' onMouseDown={startDragging}></div>

            <div className='rightPanel h-full overflow-auto flex flex-col' style={{ width: `${100-leftWidth}%`}}>

                <div className='flex gap-x-1.5 justify-start items-center px-4 py-2 basis-[5%]'>
                    <div>
                        <button className="btn btn-success btn-sm" onClick={handleSubmission} disabled={submissionStatus === "Processing"}>{submissionStatus==="Processing" ? "Processing" : "Submit"}</button>
                    </div>
                    
                    <div>
                        <select 
                            className="select select-info w-full select-sm max-w-xs" 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            
                            {Languages.map((language: languageSupport) => (
                                <option key={language.value} value={language.value}> {language.languageName} </option>
                            ))}
                        </select>
                    </div>
                    <div>
                    <select 
                            className="select select-info w-full select-sm max-w-xs" 
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        > 
                            {Themes.map((theme: themeStyle) => (
                                <option key={theme.value} value={theme.value}> {theme.themeName} </option>
                            ))}
                        </select>
                    </div>

                </div>
                
                <div className="flex flex-col editor-console grow-[1] ">

                    <div className='editorContainer grow-[1]'>
                        <AceEditor
                            mode={language}
                            theme={theme}
                            value={code}
                            onChange={(e: string) => setCode(e)}
                            name='codeEditor'
                            className='editor'
                            style={{ width: '100%'}}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                showLineNumbers: true,
                                fontSize: 16
                            }}
                            height='100%'
                        />
                    </div>

                    { /* Collapsable test case part */ }

                    <div className="collapse bg-base-200 rounded-none">
                        <input type="checkbox" className="peer" id="input-output-collapsible"/> 
                        <div className="collapse-title bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content">
                            Console {submissionStatus && `(${submissionStatus})`}
                        </div>
                        <div className="collapse-content bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content"> 
                        <div role="tablist" className="tabs tabs-boxed w-3/5 mb-4">
                            <a onClick={() => setTestCaseTab('input')} role="tab" className={isInputTabActive('input')}>Input</a>
                            <a onClick={() => setTestCaseTab('output')} role="tab" className={isInputTabActive('output')}>Output</a>
                        </div>
                            
                            {(testCaseTab === 'input') ? 
                                <textarea rows={4} cols={70} className='bg-neutral text-white rounded-md resize-none'/> : 

                                <div className='bg-neutral rounded-md p-4'>
                                    {renderOutput()}
                                </div>
                            }
                        </div>
                    </div>
                
                </div>

            </div>

        </div>
    )
}

export default Description;
