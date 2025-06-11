import "./index.scss";

export const WinModal = ({ tickets, isOpenModal, onClose }) => {

  return (
    <div className={`modal ${isOpenModal ? 'open' : ''}`}>
      <div className="modal__inner">
        <header className="modal__head">
          <span className="modal__head-decor"></span>
          <p>Поздравляем!</p>
        </header>

        <div className="modal__content">
          <div className="modal__info">
            <p>Ты выиграл</p>

            <div className="img-ticket">
              <img
                src="./icons/tickets/ticketNoShadow.svg"
                alt="иконка билета"
              />
            </div>

            <p>{tickets} билетов</p>
          </div>

          <footer className="modal__footer">
            <button className="modal__btn" onClick={onClose}>Забрать подарок</button>
          </footer>
        </div>
      </div>
    </div>
  );
};
