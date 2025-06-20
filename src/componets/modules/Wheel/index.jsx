import { Carousel } from "../../shared/Carousel";

export const WheelPage = () => {
  return (
    <>
      <header className="header">
        <div className="contaiber">
          <div className="header__inner">Header</div>
        </div>
      </header>

      <main className="main">
        <Carousel />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer__inner">Footer</div>
        </div>
      </footer>
    </>
  );
};
