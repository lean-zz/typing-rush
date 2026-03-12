type CountdownScreenProps = {
  value: number;
};

export const CountdownScreen = ({ value }: CountdownScreenProps) => (
  <section className="countdown-screen card">
    <h2>Get Ready</h2>
    <strong>{value}</strong>
  </section>
);
