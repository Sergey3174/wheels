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
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [winPrize, setWinPrize] = useState(null);

  const isSmall = useRef(false);
  const cardWidth = useRef(null);
  const currentActiveIndex = useRef(1);
  const itemsBox = useRef(null);
  const repeatCount = useRef(3);
  const gap = useRef(8);
  const totalWidth = useRef(0);
  const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const startScrollSound = new Audio("/sounds/open-case.wav");
  const scrollSound = new Audio("/sounds/case-spin.mp3");
  const scrollEndSound = new Audio("/sounds/take-drop.wav");

  const AUDIO_VOLUME = {
    scrollStart: 0.3,
    scroll: 0.3,
    scrollEnd: 0.4,
  };

  const CARD_SIZES = {
    small: 145,
    large: 170,
  };

  const getCardWidth = () =>
    window.innerWidth >= 460 ? CARD_SIZES.large : CARD_SIZES.small;

  useEffect(() => {
    startScrollSound.volume = AUDIO_VOLUME.scrollStart;
    scrollSound.volume = AUDIO_VOLUME.scroll;
    scrollEndSound.volume = AUDIO_VOLUME.scrollEnd;
  }, []);

  useEffect(() => {
    const width = getCardWidth();
    cardWidth.current = width;
    isSmall.current = width === CARD_SIZES.small;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await getItems();

      requestAnimationFrame(() => {
        centerActiveElement();
      });

      if (itemsBox.current) {
        totalWidth.current = itemsBox.current.scrollWidth / repeatCount.current;
      }
    };

    fetchData();
  }, []);

  // Получить предметы для рулетки
  const getItems = async () => {
    try {
      const { data } = await axios.get("https://app.gamesport.com/api/wheel", {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA3fQ.TYPMgCe9UaYafGHtjELDOhF25FabF9Madx_NrHfzLvo`,
          "Content-Type": "application/json",
        },
      });

      if (data.data.wheel_prizes.length) {
        setItems([...data.data.wheel_prizes]);
        setIsLoading(true);
      } else {
        alert("Извините, но вы не можете крутить колесо");
      }
    } catch (error) {
      console.error("Ошибка при получении карточек:", error);
    }
  };
  // Получить выигрышныйId
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
      if (data.data.prize_id) {
        return data.data.prize_id;
      } else {
        console.error(data.data.message);
        return null;
      }
    } catch (error) {
      console.error("Ошибка при получении выигрышной карточки:", error);
    }
  };
  // Получить рандомное смещение для маленьких и больших экранов
  const getRandomShiftOffset = () => {
    if (isSmall.current) {
      return Math.floor(Math.random() * 86) - 60;
    } else {
      return Math.floor(Math.random() * 126) - 115;
    }
  };

  const createAnimation = (shift, winCard, prizeId) => {
    const randomOffset = getRandomShiftOffset();

    // Дополнительный отступ для различных экранов и отступов(чтобы нормально работала смена активного элемента)
    const additionalOffset = isSmall.current ? 30 : 0;

    // Анимация прокрутки с рандомным смещением
    return gsap
      .timeline()
      .to(itemsBox.current, {
        x: 0,
        duration: 0,
        force3D: true,
        willChange: "transform",
        ease: "none",
      })
      .to(itemsBox.current, {
        x: `-=${shift + randomOffset}`,
        duration: 10,
        force3D: true,
        willChange: "transform",
        ease: "power4.out",
        // звук открытия крутилки
        onStart: function () {
          if (!isIPhone) {
            startScrollSound.currentTime = 0;
            startScrollSound.play().catch(() => {});
          }
        },
        onUpdate: function () {
          const currentX = gsap.getProperty(itemsBox.current, "x");
          let centerIndex;
          // Динамически считает какой элемент в центре
          centerIndex = Math.round(
            Math.abs(currentX + additionalOffset + gap.current * prizeId - 2) /
              cardWidth.current
          );
          // Для проигрыша звука
          if (currentActiveIndex.current !== centerIndex) {
            if (!isIPhone) {
              scrollSound.currentTime = 0;
              scrollSound.play().catch(() => {});
            }
          }
          currentActiveIndex.current = centerIndex;
        },
        onComplete: () => {
          // проигрыш финального звука
          if (!isIPhone) {
            scrollEndSound.currentTime = 0;
            scrollEndSound.play().catch(() => {});
          }

          const cards = document.querySelectorAll(".cardsScroll-item");
          // удаляем все возможные активные элементы
          cards.forEach((item) =>
            item.classList.remove("activeScroll", "active")
          );
          // выигрышной карте ставим active
          const winningCard = cards[winCard + 1];
          if (winningCard) {
            winningCard.classList.add("active");
            // Нужно для правильной анимации центровки активного элемента
            centerActiveElement();
          }
          // Открываем модалку и выключаем дизейбл у кнопки
          setIsScrolling(false);
          setIsOpenModal(true);
        },
      });
  };

  const centerActiveElement = () => {
    const activeCard = document.querySelector(".cardsScroll-item.active");

    const activeCardWidth = isSmall.current ? 183 : 213;
    const container = itemsBox.current;

    if (activeCard) {
      const cardRect = activeCard.getBoundingClientRect();
      const containerCenterX = window.innerWidth / 2;
      const cardCenterX = cardRect.left + activeCardWidth / 2;
      const offset = containerCenterX - cardCenterX;
      // Центрируем активный элемент
      gsap.to(container, {
        x: `+=${offset}`,
        duration: 0.5,
        force3D: true,
        willChange: "transform",
        ease: "power2.out",
      });
    }
  };

  const calculateShiftPosition = (prizeId, rounds = 2) => {
    const winCard =
      prizeId -
      2 +
      (itemsBox.current.children.length / repeatCount.current) * rounds;
    const totalCardWidth = cardWidth.current + gap.current;
    return {
      winCard,
      shiftX: winCard * totalCardWidth + cardWidth.current / 2,
    };
  };

  const startGame = async () => {
    setIsScrolling(true);

    const prizeId = await getWinCardInfo();
    if (!prizeId) {
      setIsScrolling(false);
      return;
    }

    setWinPrize(prizeId);

    // находим index выигрышной карты и считаем её позицию
    const { winCard, shiftX } = calculateShiftPosition(prizeId);
    // Удаляем active если есть
    document
      .querySelector(".cardsScroll-item.active")
      ?.classList.remove("active");
    // Создаём и запускаем анимацию
    createAnimation(shiftX, winCard, prizeId).play();
  };

  if (!isLoading) {
    return null;
  }

  return (
    <>
      <section className="carousel">
        <img
          src="/icons/decors/starBg.svg"
          alt=""
          style={{
            position: "absolute",
            inset: "0",
            width: "100%",
          }}
        />

        <div className="carousel__box">
          <div className="carousel__info">
            <div className="cardsScroll" ref={itemsBox}>
              {Array.from({ length: repeatCount.current })
                .flatMap(() => items)
                .map((item, index) => (
                  <Item
                    key={index}
                    index={index}
                    count={item.tickets}
                    isActive={index === 1 ? "active" : ""}
                  />
                ))}
            </div>

            <div className="cardsScroll__mark">
              <img src="/icons/marks/mark.svg" alt="иконка треугольника" />
            </div>
          </div>

          <div className="carousel__footer">
            <Button type={"button"} disabled={isScrolling} onClick={startGame}>
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

      {winPrize && (
        <WinModal
          tickets={items[winPrize - 1].tickets}
          isOpenModal={isOpenModal}
          onClose={() => setIsOpenModal(false)}
        />
      )}
    </>
  );
};
