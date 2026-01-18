/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { getUserInfo, getCardList, setUserInfo, 
        setUserAvatar, addCard, deleteСard as apiDeleteCard,
        changeLikeCardStatus } from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { getUsersCount, getLikeCount, 
        getMaxLikes, getLikesChampion, getPopularCards } from "./components/calcStat.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const profileSubmitButton = profileForm.querySelector(".popup__button");
const cardSubmitButton = cardForm.querySelector(".popup__button");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const statsModal = document.querySelector(".popup_type_info");
const statsTitle = statsModal.querySelector(".popup__title");
const statsText = statsModal.querySelector(".popup__text");
const infoModalWindow = document.querySelector('.popup_type_info');
const openInfoButton = document.querySelector('.header__logo');

let currentUser_id = null;

// Создание объекта с настройками валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// включение валидации вызовом enableValidation
// все настройки передаются при вызове
enableValidation(validationSettings);

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const originalText = profileSubmitButton.textContent;
  profileSubmitButton.textContent = "Сохранение...";

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
      clearValidation(validationSettings);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      profileSubmitButton.textContent = originalText;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const originalText = avatarSubmitButton.textContent;
  avatarSubmitButton.textContent = "Сохранение...";

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      clearValidation(validationSettings);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      avatarSubmitButton.textContent = originalText;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const originalText = cardSubmitButton.textContent;
  cardSubmitButton.textContent = "Создание...";

  const name = cardNameInput.value;
  const link = cardLinkInput.value;

  addCard({ name, link })
    .then((cardData) => {
      const newCardElement = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (cardId, likeButton, likeCountElement, isLiked) => {
            changeLikeCardStatus(cardId, isLiked)
              .then((updatedCard) => {
                likeButton.classList.toggle("card__like-button_is-active");
                if (likeCountElement) {
                  likeCountElement.textContent = updatedCard.likes.length;
                }
              })
              .catch((err) => {
                console.log("Ошибка при обновлении лайка:", err);
              });
          },
          onDeleteCard: (cardElement) => {
            handleApiDeleteCard(cardData._id, cardElement);
          },
        },
        currentUser_id
      );

      placesWrap.prepend(newCardElement);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
      clearValidation(validationSettings);
    })
    .catch((err) => {
      console.log("Ошибка при добавлении карточки:", err);
    })
    .finally(() => {
      cardSubmitButton.textContent = originalText;
    });
};

const handleApiDeleteCard = (cardId, cardElement) => {
  apiDeleteCard(cardId)
    .then(() => {
      // Удаляем карточку из DOM только после успешного ответа
      cardElement.remove();
    })
    .catch((err) => {
      console.log("Ошибка при удалении карточки:", err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Загрузка данных с сервера и отрисовка
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    // Сохраняем ID текущего пользователя
    currentUser_id = userData._id;

    // Обновляем профиль пользователя
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    // Отрисовываем карточки
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (cardId, likeButton, likeCountElement, isLiked) => {
            changeLikeCardStatus(cardId, isLiked)
              .then((updatedCard) => {
                likeButton.classList.toggle("card__like-button_is-active");
                if (likeCountElement) {
                  likeCountElement.textContent = updatedCard.likes.length;
                }
              })
              .catch((err) => {
                console.log("Ошибка при обновлении лайка:", err);
              });
          },
          onDeleteCard: (cardElement) => {
            handleApiDeleteCard(cardData._id, cardElement);
          },
        }, currentUser_id)
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

const handleOpenStats = () => {
  getCardList()
    .then((cardsList) => {
      const UsersCount = getUsersCount(cardsList);
      const LikesCount = getLikeCount(cardsList);
      const MaxLikes = getMaxLikes(cardsList);
      const LikesChampion = getLikesChampion(cardsList);
      const popularCards = getPopularCards(cardsList);
      const modalStat = document.querySelector('.popup__content_content_info');
      const statElement = document.getElementById("popup-info-definition-template").content.querySelector('.popup__info-item').cloneNode(true);
      const popularCardElement = document.getElementById("popup-info-user-preview-template").content.querySelector('.popup__list-item_type_badge').cloneNode(true);

      // Очистка контейнеров
      const infoContainer = modalStat.querySelector('.popup__info');
      const listContainer = modalStat.querySelector('.popup__list');
      
      infoContainer.innerHTML = '';
      listContainer.innerHTML = '';

      const stat = [statElement.cloneNode(true), statElement.cloneNode(true), statElement.cloneNode(true), statElement.cloneNode(true)];
      stat[0].querySelector('.popup__info-term').textContent = 'Всего пользователей';
      stat[0].querySelector('.popup__info-description').textContent = UsersCount;
      stat[1].querySelector('.popup__info-term').textContent = 'Всего лайков';
      stat[1].querySelector('.popup__info-description').textContent = LikesCount;
      stat[2].querySelector('.popup__info-term').textContent = 'Максимально лайков от одного';
      stat[2].querySelector('.popup__info-description').textContent = MaxLikes;
      stat[3].querySelector('.popup__info-term').textContent = 'Чемпион лайков';
      stat[3].querySelector('.popup__info-description').textContent = LikesChampion;

      const cardsToShow = Math.min(3, popularCards.length);
      for (let i = 0; i < cardsToShow; i++) {
        const cardItem = popularCardElement.cloneNode(true);
        cardItem.textContent = popularCards[i];
        listContainer.append(cardItem);
      }
      
      //Вывод 
      statsTitle.textContent = "Статистика карточек";
      stat.forEach((pair) => {        
        infoContainer.append(pair);
      });
      statsText.textContent = "Популярные карточки:";
      popularCardsList.forEach((popularCard) => {
        listContainer.append(popularCard);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

openInfoButton.addEventListener("click", () => {
  openModalWindow(infoModalWindow);
  handleOpenStats();
});