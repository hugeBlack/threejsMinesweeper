let canUserClick = false

const setCanUserClick = (b) => {
    canUserClick = b
}

const getCanUserClick = () => {
    return canUserClick
}

export {
    setCanUserClick,
    getCanUserClick
}