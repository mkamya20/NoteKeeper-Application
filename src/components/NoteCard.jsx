import React, { useRef, useEffect, useState } from 'react'
import {setNewOffset, autoGrow, setZIndex, bodyParser} from '../utils.js'
import { db } from '../appwrite/databases.js'
import Spinner from '../icons/Spinner.jsx';
// import Trash from '../icons/Trash.jsx';
import DeleteButton from './DeleteButton.jsx';
import { useContext } from 'react';
import { NoteContext } from '../context/NoteContext';



const NoteCard = ({ note }) => {
    const [saving, setSaving] = useState(false);
    const keyUpTimer = useRef(null);
    const [position, setPosition] = useState(JSON.parse(note.position));
    const colors = JSON.parse(note.colors);
    const body = bodyParser(note.body);
    const { setSelectedNote } = useContext(NoteContext);



    let mouseStartPos = { x: 0, y: 0 };
 
    const cardRef = useRef(null);

    const textAreaRef = useRef(null)

    useEffect(() => {
        autoGrow(textAreaRef);
        setZIndex(cardRef.current);
    }, []);

   

    const mouseDown = (e) => {
        if (e.target.className === "card-header") {
        mouseStartPos.x = e.clientX;
        mouseStartPos.y = e.clientY;
     
        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("mouseup", mouseUp);

        setZIndex(cardRef.current);
        setSelectedNote(note);
        }
    };

    const mouseMove = (e) => {
        //1 - Calculate move direction
        let mouseMoveDir = {
            x: mouseStartPos.x - e.clientX,
            y: mouseStartPos.y - e.clientY,
        };
     
        //2 - Update start position for next move.
        mouseStartPos.x = e.clientX;
        mouseStartPos.y = e.clientY;

        const newPosition = setNewOffset(cardRef.current, mouseMoveDir);
        setPosition(newPosition);
     
        //3 - Update card top and left position.

    };

    const mouseUp = () => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);

        const newPosition = setNewOffset(cardRef.current);
        saveData("position", newPosition);
        
    };

    const saveData = async (key, value) => {
        const payload = { [key]: JSON.stringify(value) };
        try {
            await db.notes.update(note.$id, payload);
        } catch (error) {
            console.error(error);
        }
        setSaving(false);
    };

    const handleKeyUp = async () => {
        //1 - Initiate "saving" state
        setSaving(true);
     
        //2 - If we have a timer id, clear it so we can add another two seconds
        if (keyUpTimer.current) {
            clearTimeout(keyUpTimer.current);
        }
     
        //3 - Set timer to trigger save in 2 seconds
        keyUpTimer.current = setTimeout(() => {
            saveData("body", textAreaRef.current.value);
        }, 2000);
    };

    return (
        <div
            ref={cardRef}
            className="card"
            style={{
                backgroundColor: colors.colorBody,
                left: `${position.x}px`,
                top: `${position.y}px`,}}
        >

    <div
        onMouseDown={mouseDown}
        className="card-header"
        style={{ backgroundColor: colors.colorHeader }}
    >
       {/* <Trash /> */}
       <DeleteButton noteId={note.$id}  />

        {
            saving && (
                <div className="card-saving">
                    <Spinner size={20} color={colors.colorText} />
                    <span style={{ color: colors.colorText }}>Saving...</span>
                </div>
            )
        }
    </div>
             <div className="card-body">
        <textarea
            onKeyUp={handleKeyUp}
            onFocus={() => {setZIndex(cardRef.current); setSelectedNote(note);}}
            ref={textAreaRef}
            style={{ color: colors.colorText }}
            defaultValue={body}
            onInput={() => {
                autoGrow(textAreaRef);
           }}
        ></textarea>
    </div>
        </div>
    );
};
export default NoteCard