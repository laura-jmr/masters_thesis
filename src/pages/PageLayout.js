import './PageLayout.css';

function PageLayout({ children }) {

    return (
        <div id='page-layout'>
            <header>
                
            </header>

            <main>
                {children}
            </main>

            <footer>
                <p>
                    © Laura Jürgensmeier 2026
                </p>
                <p>
                    Master's Thesis Project for Computer Science @ HCC FU Berlin
                </p>
            </footer>
        </div>
    );
}

export default PageLayout;