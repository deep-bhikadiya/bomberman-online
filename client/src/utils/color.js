export const idToColor = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (hash >> 16) & 0xff;
    const g = (hash >> 8) & 0xff;
    const b = hash & 0xff;
    return `rgb(${Math.abs(r)}, ${Math.abs(g)}, ${Math.abs(b)})`;
  };
  