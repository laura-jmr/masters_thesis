import './PageLayout.css';

function PageLayout({ children }) {

    return (
        <div id='page-layout'>
            <header>
                <h1>ReasonAId</h1>
            </header>

            <main>
                {children}
            </main>
        </div>
    );
}

export default PageLayout;