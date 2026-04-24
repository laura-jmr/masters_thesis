import './Tooltip.css';

function Tooltip({ text, align = "right", children }) {

    return (
        <div className="tooltip">
            {children}
            <span className={`tooltip-text tooltip-${align}`}>{text}</span>
        </div>
    );
}

export default Tooltip;
