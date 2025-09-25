export default function MobileCardList({ data, renderItem }) {
    return (
        <div className="md:hidden space-y-4">
            {data.map((item) => renderItem(item))}
        </div>
    );
}
