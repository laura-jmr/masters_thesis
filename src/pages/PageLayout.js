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

            <footer>
                <p>© Laura Jürgensmeier, 2026</p>
                <p>Master's Thesis for Computer Science Master</p>
            </footer>
        </div>
    );
}

export default PageLayout;