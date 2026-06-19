export function Loader() {
  return (
    <div
      className="domino-spinner"
      style={{
        position: "relative",
        width: 40,
        height: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
      }}
    >
      <span style={s(50, "0.125s")} />
      <span style={s(44, "0.3s")} />
      <span style={s(38, "0.425s")} />
      <span style={s(32, "0.54s")} />
      <span style={s(26, "0.665s")} />
      <span style={s(20, "0.79s")} />
      <span style={s(14, "0.915s")} />
      <span style={s(8, "0s")} />
      <style>{`
        .domino-spinner span { animation: dominos 1s ease infinite; }
        @keyframes dominos {
          50% { opacity: 0.7; }
          75% { transform: rotate(90deg); }
          80% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function s(left: number, delay: string): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    left,
    width: 22,
    height: 5,
    background: "#fff",
    animationDelay: delay,
    boxShadow: "2px 2px 3px 0px black",
  };
}
