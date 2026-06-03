import React, {useState} from "react";

export function GlassWrapper({children}) {
    const [accentColor] = useState('#003366');
    const [glassBlur] = useState(20);
    return (
        <div className="canvas" style={{'--accent': accentColor, '--blur': `${glassBlur}px`}}>
            {/*<div className="orb orb-1"></div>*/}
            {/*<div className="orb orb-2"></div>*/}

            <div className="glass-wrapper">{children}</div>
        </div>


    )
}
