export const getStyle = (backgroundColor, resultsDisable = false) => ({
    width: 110,
    height: 70,
    textAlign: 'center',
    backgroundColor: backgroundColor,
    cursor: resultsDisable ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    margin: "0px 15px"
})