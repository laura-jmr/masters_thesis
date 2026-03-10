import './Sidemenu.css';
import { useState } from 'react';

function Sidemenu() {
    const [openBox, setOpenBox] = useState(null);

    const toggleBox = (boxName) => {
        setOpenBox(openBox === boxName ? null : boxName);
    };

    return (
        <div className='sidemenu'>
            <h2>Information</h2>
            <div className='sidemenu-buttons'>
                <div>
                    <button onClick={() => toggleBox('personal')}><i class="fa fa-address-card"></i>
                        Personal Data</button>
                    {openBox === 'personal' && (
                        <div className='info-box' id='personal-info'>
                            <div>
                                <p><span>Name:</span></p>
                                <p>Max Mustermann</p>
                            </div>
                            <div>
                                <p><span>Age:</span></p>
                                <p>29</p>
                            </div>
                            <div>
                                <p><span>Insurance:</span></p>
                                <p>iKK</p>
                            </div>
                            <div>
                                <p><span>Address:</span></p>
                                <p>Berlin</p>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <button onClick={() => toggleBox('consent')}><i class="fa fa-envelope-open"></i> Consent Request</button>
                    {openBox === 'consent' && (
                        <div className='info-box'>
                            <p>
                                This consent request asks whether you want to share your
                                fictive personal data for research purposes.
                            </p>
                            <p>
                                You can read all details carefully before making your decision.
                            </p>
                            <p>
                                Additional information can be placed here so the box becomes scrollable.
                            </p>
                            <p>
                                More text... More text... More text... More text... More text...
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <p>© Laura Jürgensmeier, 2026</p>
            <p>Master's Thesis for Computer Science Master</p>
        </div>
    );
}

export default Sidemenu;
