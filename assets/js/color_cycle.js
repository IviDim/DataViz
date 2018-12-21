function colorCycle(colors) {

    let index = -1;

    return () => {

        index = (index + 1) % colors.length;
        return colors[index];
    }
}