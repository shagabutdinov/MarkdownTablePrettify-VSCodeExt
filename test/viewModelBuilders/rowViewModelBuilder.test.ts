import * as assert from 'assert';
import { IMock, Mock, It, Times } from "typemoq";
import { assertExt } from "../assertExtensions";
import { RowViewModelBuilder } from "../../src/viewModelBuilders/rowViewModelBuilder";
import { RowViewModelBuilderParam } from "../../src/viewModelBuilders/rowViewModelBuilderParam";
import { PadCalculator } from "../../src/viewModelBuilders/padCalculator";

suite("RowViewModelBuilder.buildRow() tests", () => {
    let _padCalculator: IMock<PadCalculator>;

    setup(() => {
        _padCalculator = Mock.ofType<PadCalculator>();
    });

    test("padCalculator called for all columns with expected values", () => {
        const sut = createBuilder(_padCalculator.object);
        let param = new RowViewModelBuilderParam([5, 5, 5], false, false);
        param.rowValues = ["c1", "c2", "c3"];

        const rowViewModel = sut.buildRow(param);

        _padCalculator.verify(_ => _.getLeftPadding(" ", param, 0), Times.once());
        _padCalculator.verify(_ => _.getLeftPadding(" ", param, 1), Times.once());
        _padCalculator.verify(_ => _.getLeftPadding(" ", param, 2), Times.once());

        _padCalculator.verify(_ => _.getRightPadding(" ", param, 0), Times.once());
        _padCalculator.verify(_ => _.getRightPadding(" ", param, 1), Times.once());
        _padCalculator.verify(_ => _.getRightPadding(" ", param, 2), Times.once());
    });

    test("value returned from padCalculator.getLeftPadding is used to start the row value", () => {
        const sut = createBuilder(_padCalculator.object);
        let param = new RowViewModelBuilderParam([5, 5, 5], false, false);
        param.rowValues = ["c1", "c2", "c3"];
        _padCalculator.setup(_ => _.getLeftPadding(" ", param, 0)).returns(() => "test");
        
        const rowViewModel = sut.buildRow(param);

        assert.equal(rowViewModel.getValueAt(0).startsWith("test"), true);
    });

    test("value returned from padCalculator.getRightPadding is used to end the row value", () => {
        const sut = createBuilder(_padCalculator.object);
        let param = new RowViewModelBuilderParam([5, 5, 5], false, false);
        param.rowValues = ["c1", "c2", "c3"];
        _padCalculator.setup(_ => _.getRightPadding(" ", param, 0)).returns(() => "test");
        
        const rowViewModel = sut.buildRow(param);

        assert.equal(rowViewModel.getValueAt(0).endsWith("test"), true);
    });

    test("Empty middle column is tranformed into a single space", () => {
        const sut = createBuilder(_padCalculator.object);
        let param = new RowViewModelBuilderParam([5, 0, 5], false, false);
        param.rowValues = ["c1", "", "c3"];
        _padCalculator.setup(_ => _.getLeftPadding(" ", param, 1)).returns(() => "L");
        _padCalculator.setup(_ => _.getRightPadding(" ", param, 1)).returns(() => "R");
        
        const rowViewModel = sut.buildRow(param);

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(1), "L R");
    });
});

suite("RowViewModelBuilder.buildSeparator() tests", () => {
    let _padCalculator: IMock<PadCalculator>;
    
    test("Regular first column not left padded and right padded with 1 dash", () => {
        const sut = createBuilder(_padCalculator.object);

        const rowViewModel = sut.buildSeparator(new RowViewModelBuilderParam([5, 5, 5], false, false));

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(0), "------");
    });

    test("Regular middle column left and right padded 1 dash each", () => {
        const sut = createBuilder(_padCalculator.object);

        const rowViewModel = sut.buildSeparator(new RowViewModelBuilderParam([5, 5, 5], false, false));

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(1), "-------");
    });

    test("Regular last column left and right padded with 1 dash each", () => {
        const sut = createBuilder(_padCalculator.object);

        const rowViewModel = sut.buildSeparator(new RowViewModelBuilderParam([5, 5, 5], false, false));

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(2), "-------");
    });

    test("Empty first column has no padding", () => {
        const sut = createBuilder(_padCalculator.object);

        const rowViewModel = sut.buildSeparator(new RowViewModelBuilderParam([0, 5, 5], false, false));

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(0), "");
    });

    test("Empty middle column should be 3 dashes long", () => {
        const sut = createBuilder(_padCalculator.object);

        const rowViewModel = sut.buildSeparator(new RowViewModelBuilderParam([5, 0, 5], false, false));

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(1), "---");
    });

    test("Empty last column has no padding", () => {
        const sut = createBuilder(_padCalculator.object);

        const rowViewModel = sut.buildSeparator(new RowViewModelBuilderParam([5, 5, 0], false, false));

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(2), "");
    });

    test("Four columns with no empty first or last columns, all columns are correctly padded with dashes", () => {
        const sut = createBuilder(_padCalculator.object);

        const rowViewModel = sut.buildSeparator(new RowViewModelBuilderParam([5, 0, 8, 5], false, false));

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(0), "------");
        assert.equal(rowViewModel.getValueAt(1), "---");
        assert.equal(rowViewModel.getValueAt(2), "----------");
        assert.equal(rowViewModel.getValueAt(3), "-------");
    });

    test("Four columns with empty first and non-empty last, all columns are correctly padded with dashes", () => {
        const sut = createBuilder(_padCalculator.object);

        const rowViewModel = sut.buildSeparator(new RowViewModelBuilderParam([0, 4, 8, 5], false, false));

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(0), "");
        assert.equal(rowViewModel.getValueAt(1), "------");
        assert.equal(rowViewModel.getValueAt(2), "----------");
        assert.equal(rowViewModel.getValueAt(3), "-------");
    });

    test("Four columns with non-empty first and empty last, all columns are correctly padded with dashes", () => {
        const sut = createBuilder(_padCalculator.object);

        const rowViewModel = sut.buildSeparator(new RowViewModelBuilderParam([3, 3, 3, 0], false, false));

        assertExt.isNotNull(rowViewModel);
        assert.equal(rowViewModel.getValueAt(0), "----");
        assert.equal(rowViewModel.getValueAt(1), "-----");
        assert.equal(rowViewModel.getValueAt(2), "-----");
        assert.equal(rowViewModel.getValueAt(3), "");
    });
});

function createBuilder(padCalculator: PadCalculator): RowViewModelBuilder {
    var rowVmb = new RowViewModelBuilder(padCalculator);
    return rowVmb;
}