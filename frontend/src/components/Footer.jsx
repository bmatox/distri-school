import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>DistriSchool</h3>
            <p>Sistema distribuído de gestão escolar moderno e eficiente.</p>
          </div>
          <div className="footer-section">
            <h4>Links Rápidos</h4>
            <ul>
              <li><a href="/">Dashboard</a></li>
              <li><a href="/usuarios">Usuários</a></li>
              <li><a href="/professores">Professores</a></li>
              <li><a href="/alunos">Alunos</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Suporte</h4>
            <ul>
              <li><a href="#documentacao">Documentação</a></li>
              <li><a href="#ajuda">Central de Ajuda</a></li>
              <li><a href="#contato">Contato</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} DistriSchool. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
