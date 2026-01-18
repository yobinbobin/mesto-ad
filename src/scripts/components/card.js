export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  currentUser_id = null
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  if (likeCountElement && data.likes) {
    likeCountElement.textContent = data.likes.length;
  }

  // Заполняем данные
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  // Устанавливаем начальное состояние лайка
  const isLiked = data.likes && data.likes.some(like => like._id === currentUser_id);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Скрываем кнопку удаления, если пользователь не владелец
  if (currentUser_id && data.owner && data.owner._id !== currentUser_id) {
    deleteButton.remove(); // или deleteButton.style.display = "none";
  } else {
    if (onDeleteCard) {
      deleteButton.addEventListener("click", () => onDeleteCard(cardElement));
    }
  }

  // Обработчик лайка
  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      const currentlyActive = likeButton.classList.contains("card__like-button_is-active");
      onLikeIcon(data._id, likeButton, likeCountElement, currentlyActive);
    });
  }

  // Обработчик просмотра изображения
  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};