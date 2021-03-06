import * as assert from 'assert';
import { IMock, Mock, It, Times } from "typemoq";
import { assertExt } from "../../assertExtensions";
import { PadCalculator } from "../../../src/padCalculation/padCalculator";
import { RowViewModelFactory } from '../../../src/viewModelFactories/rowViewModelFactory';
import { Table } from '../../../src/models/table';
import { Alignment } from '../../../src/models/alignment';
import { Cell } from '../../../src/models/cell';
import { AlignmentMarkerStrategy, IAlignmentMarker } from '../../../src/viewModelFactories/alignmentMarking';
import { RowViewModel } from '../../../src/viewModels/rowViewModel';

suite("RowViewModelFactory.buildRow() tests", () => {
    let _contentPadCalculator: IMock<PadCalculator>;

    setup(() => {
        _contentPadCalculator = Mock.ofType<PadCalculator>();
    });

    test("PadCalculator called for all columns with expected values", () => {
        const sut = createFactory(_contentPadCalculator.object);
        const row = 1;
        const table = threeColumnTable();

        sut.buildRow(row, table);

        _contentPadCalculator.verify(_ => _.getLeftPadding(table, row, 0), Times.once());
        _contentPadCalculator.verify(_ => _.getLeftPadding(table, row, 1), Times.once());
        _contentPadCalculator.verify(_ => _.getLeftPadding(table, row, 2), Times.once());

        _contentPadCalculator.verify(_ => _.getRightPadding(table, row, 0), Times.once());
        _contentPadCalculator.verify(_ => _.getRightPadding(table, row, 1), Times.once());
        _contentPadCalculator.verify(_ => _.getRightPadding(table, row, 2), Times.once());
    });

    test("Value returned from padCalculator.getLeftPadding is used to start the row value", () => {
        const sut = createFactory(_contentPadCalculator.object);
        const row = 1;
        const table = threeColumnTable();
        _contentPadCalculator.setup(_ => _.getLeftPadding(It.isAny(), It.isAny(), It.isAny())).returns(() => "test");
        
        const rowViewModel = sut.buildRow(row, table);

        assert.equal(rowViewModel.getValueAt(1).startsWith("test"), true);
    });

    test("Value returned from padCalculator.getRightPadding is used to end the row value", () => {
        const sut = createFactory(_contentPadCalculator.object);
        const row = 1;
        const table = threeColumnTable();
        _contentPadCalculator.setup(_ => _.getRightPadding(It.isAny(), row, It.isAny())).returns(() => "test");
        
        const rowViewModel = sut.buildRow(row, table);

        assert.equal(rowViewModel.getValueAt(1).endsWith("test"), true);
    });

    test("Empty middle column uses only left and right pad to create the value", () => {
        const sut = createFactory(_contentPadCalculator.object);
        const row = 1;
        const table = threeColumnTableWithEmptyMiddleColumn();
        _contentPadCalculator.setup(_ => _.getLeftPadding(It.isAny(), It.isAny(), It.isAny())).returns(() => "L");
        _contentPadCalculator.setup(_ => _.getRightPadding(It.isAny(), row, It.isAny())).returns(() => "R");
        _contentPadCalculator.setup(_ => _.getPadChar()).returns(() => "x");
        
        const rowViewModel = sut.buildRow(row, table);

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(1), "LR");
    });
});

suite("RowViewModelFactory.buildSeparator() tests", () => {
    let _contentPadCalculator: IMock<PadCalculator>;

    setup(() => {
        _contentPadCalculator = Mock.ofType<PadCalculator>();
    });

    test("Fills separator with dashes using the max length of the columns", () => {
        const sut = createFactory(_contentPadCalculator.object);
        const table = threeColumnTable();
        const rows: RowViewModel[] = [
            new RowViewModel(["abc", "defghi"]),
            new RowViewModel(["abcd", "efgh"])
        ];

        const separator = sut.buildSeparator(rows, table);

        assert.equal(separator.getValueAt(0), "----");
        assert.equal(separator.getValueAt(1), "------");
    });

    test("Calls marker to mark the beginning and end", () => {
        const alignmentStrategy = Mock.ofType<AlignmentMarkerStrategy>();
        const alignmentMarker = Mock.ofType<IAlignmentMarker>();
        alignmentMarker.setup(_ => _.mark(It.isAny())).returns((input) => input).verifiable(Times.exactly(3));
        alignmentStrategy.setup(_ => _.markerFor(It.isAny())).returns(() => alignmentMarker.object).verifiable(Times.exactly(3));

        const sut = createFactory(_contentPadCalculator.object, alignmentStrategy.object);
        const table = threeColumnTable();
        const rows: RowViewModel[] = [
            new RowViewModel(["abc", "defghi", "xyx"]),
            new RowViewModel(["abcd", "efgh", "xyz"])
        ];

        sut.buildSeparator(rows, table);

        alignmentStrategy.verifyAll();
        alignmentMarker.verifyAll();
    });
});

function threeColumnTable(alignment: Alignment = Alignment.NotSet): Table {
    return tableFor([
        [ "aaaaa", "bbbbb", "ccccc" ],
        [ "aaaaa", "bbbbb", "ccccc" ]
    ], alignment);
}

function threeColumnTableWithEmptyMiddleColumn(alignment: Alignment = Alignment.NotSet): Table {
    return tableFor([
        [ "aaaaa", "", "ccccc" ],
        [ "aaaaa", "", "ccccc" ]
    ], alignment);
}

function tableFor(rows: string[][], alignment: Alignment) {
    const alignments: Alignment[] = rows[0].map(() => alignment);
    let table = new Table(rows.map(row => row.map(c  => new Cell(c))), alignments);
    return table;
}

function createFactory(contentPadCalculator: PadCalculator, alignmentStrategy: AlignmentMarkerStrategy = null): RowViewModelFactory 
{
    alignmentStrategy = alignmentStrategy == null ? new AlignmentMarkerStrategy(":") : alignmentStrategy;
    return new RowViewModelFactory(contentPadCalculator, alignmentStrategy);
}