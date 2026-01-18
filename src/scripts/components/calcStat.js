export const getUsersCount = (cardsList) => {
  const ownerIds = cardsList.map(card => card.owner._id);
  return new Set(ownerIds).size;
};

export const getLikeCount = (cardsList) => {
  return cardsList.reduce((total, card) => total + card.likes.length, 0);
};

export const getMaxLikes = (cardsList) => {
  const userLikes = {};
  
  cardsList.forEach(card => {
    card.likes.forEach(like => {
      userLikes[like._id] = (userLikes[like._id] || 0) + 1;
    });
  });
  
  return Math.max(...Object.values(userLikes));
};

export const getLikesChampion = (cardsList) => {
  const ownerLikes = {};
  
  cardsList.forEach(card => {
    ownerLikes[card.owner._id] = (ownerLikes[card.owner._id] || 0) + card.likes.length;
  });
  
  const maxLikes = Math.max(...Object.values(ownerLikes));
  const championId = Object.keys(ownerLikes).find(id => ownerLikes[id] === maxLikes);
  const championCard = cardsList.find(card => card.owner._id === championId);
  
  return championCard.owner.name;
};

export const getPopularCards = (cardsList) => {
  const sortedCards = [...cardsList].sort((a, b) => b.likes.length - a.likes.length);
  return sortedCards.slice(0, 3).map(card => card.name);
};