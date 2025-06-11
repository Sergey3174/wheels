import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import axios from "axios";

import { Button } from "../../controls/Button";
import { Item } from "./parts/Item";
import { WinModal } from "../../modals/WinModal";

import "./index.scss";

export const Carousel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [prizeId, setPrizeId] = useState(0);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const itemsBox = useRef(null);
  const winIndex = useRef(1);
  const totalWidth = useRef(0);

  const getItems = async () => {
    try {
      const { data } = await axios.get("https://app.gamesport.com/api/wheel", {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA3fQ.TYPMgCe9UaYafGHtjELDOhF25FabF9Madx_NrHfzLvo`,
          "Content-Type": "application/json",
        },
      });

      if (data.data["can_spin"]) {
        setItems([...data.data["wheel_prizes"]]);
        setIsLoading(true);
      } else {
        alert("Извините, но вы не можете крутить колесо");
      }
    } catch (error) {
      console.error("Ошибка при получении карточек:", error);
    }
  };

  const getWinCardInfo = async () => {
    try {
      const { data } = await axios.post(
        "https://app.gamesport.com/api/wheel",
        {},
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA3fQ.TYPMgCe9UaYafGHtjELDOhF25FabF9Madx_NrHfzLvo`,
            "Content-Type": "application/json",
          },
        }
      );

      setPrizeId(data.data["prize_id"]);
      winIndex.current = data.data["prize_id"];
      return data.data["prize_id"];
    } catch (error) {
      console.error("Ошибка при получении выигрышной карточки:", error);
      winIndex.current = 4;
      setPrizeId(4); // Временное решение, так как проблема с запросом
      return 4;
    }
  };

  const createAnimation = (shift) => {
    // console.log(itemsBox.current);
    return gsap
      .timeline()
      .to(itemsBox.current, {
        x: 0,
        duration: 0,
        ease: "none",
      })
      .to(itemsBox.current, {
        x: `-=${shift}`,
        duration: 8,
        ease: "power4.out",
        onUpdate: function() {
          const currentX = gsap.getProperty(itemsBox.current, "x");
          let centerIndex;

          if (window.innerWidth < 400) {
            centerIndex = Math.round((Math.abs(currentX) / 145))
          } else {
            centerIndex = Math.round((Math.abs(currentX) / 170))
          }

          if (centerIndex > 1) {
            document.querySelectorAll('.cardsScroll-item')[centerIndex].classList.add('activeScroll')
            document.querySelectorAll('.cardsScroll-item')[centerIndex - 1].classList.remove('activeScroll')
          }


          
          // items.forEach((item, index) => {
          //   if (index === centerIndex) {
          //     gsap.to(item, { scale: 1.3 });
          //   } else {
          //     gsap.to(item, { scale: 1 });
          //   }
          // });
        },
        onComplete: () => {
          document.querySelectorAll('.cardsScroll-item').forEach((item) => item.classList.remove('activeScroll'))
          document
            .querySelectorAll(".cardsScroll-item")
            [
              winIndex.current + itemsBox.current.children.length / 5 - 1
            ].classList.add("active");

          setIsScrolling(false);
          setIsOpenModal(true);
        },
      });
  };

  const startGame = () => {
    const getWinCard = async () => {
      document
        .querySelector(".cardsScroll-item.active")
        ?.classList.remove("active");
      const winCardIndex = await getWinCardInfo();

      const winCard = winCardIndex + itemsBox.current.children.length / 5;
      const cardWidth = window.innerWidth >= 400 ? 170 : 145;
      const fullCardsWidthX = (winCard - 2) * cardWidth;
      const gapFull = (winCard - 2) * 8;
      const oneMiddleCard = cardWidth / 2;
      const positionX = fullCardsWidthX + gapFull + oneMiddleCard;

      const animation = createAnimation(positionX);
      animation.play();
    };

    getWinCard();
  };
  useEffect(() => {
    getItems();
  }, []);

  useEffect(() => {
    if (!items.length) return;

    totalWidth.current = itemsBox.current.scrollWidth / 5;
  }, [items]);

  if (!isLoading) {
    return;
  }

  return (
    <>
      <section className="carousel">
        <div className="carousel__box">
          <div className="carousel__info">
            <div className="cardsScroll" ref={itemsBox}>
              {[].concat(...Array(5).fill(items)).map((item, index) => (
                <Item key={index} count={item.tickets} />
              ))}
            </div>

            <div className="cardsScroll__mark">
              <img src="/icons/marks/mark.svg" alt="иконка треугольника" />
            </div>
          </div>

          <div className="carousel__footer">
            <Button
              type={"button"}
              disabled={isScrolling}
              onClick={() => {
                setIsScrolling(true);
                startGame(items);
              }}
            >
              <span>Крутить</span>

              <div className="button-price">
                <span>5</span>

                <span className="icon">
                  <img
                    src="/icons/tickets/ticketNoShadow.svg"
                    alt="иконка билета"
                  />
                </span>
              </div>
            </Button>
          </div>
        </div>
      </section>

      {prizeId > 0 && (
        <WinModal
          tickets={items[prizeId - 1].tickets}
          isOpenModal={isOpenModal}
          onClose={() => setIsOpenModal(false)}
        />
      )}
    </>
  );
};
