import "./index.scss";
import { Sheet } from "react-modal-sheet";

export const WinModal = ({ tickets, isOpenModal, onClose }) => {
  return (
      <Sheet
        isOpen={isOpenModal}
        onClose={onClose}
        detent={"content-height"}
        className="custom-modal-content"
      >
        <Sheet.Container>
          <Sheet.Content>
            <div className="modal">
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
                        src="./icons/tickets/ticketNoShadow.png"
                        alt="иконка билета"
                      />
                    </div>

                    <p>{tickets} билетов</p>
                  </div>

                  <footer className="modal__footer">
                    <button className="modal__btn" onClick={onClose}>
                      Забрать подарок
                    </button>
                  </footer>
                </div>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={onClose} />
      </Sheet>
  );
};
