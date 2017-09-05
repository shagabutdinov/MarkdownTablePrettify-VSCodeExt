import * as assert from "assert";
import { assertExt } from "../assertExtensions";
import { IMock, Mock, It, Times } from "typemoq";
import { Table } from "../../src/models/table";
import { Alignment } from "../../src/models/alignment";
import { TableValidator } from "../../src/modelFactory/tableValidator";
import { TableViewModel } from "../../src/viewModels/tableViewModel";
import { TableViewModelBuilder } from "../../src/viewModelBuilders/tableViewModelBuilder";
import { RowViewModel } from "../../src/viewModels/rowViewModel";
import { RowViewModelBuilder } from "../../src/viewModelBuilders/rowViewModelBuilder";
import { PadCalculator } from "../../src/viewModelBuilders/padCalculator";

suite("TableViewModelBuilder tests", () => {
    let _rowVmb: IMock<RowViewModelBuilder>;

    setup(() => {
        _rowVmb = Mock.ofType<RowViewModelBuilder>();
    });

    test("build() with calls rowVmb methods", () => {
        const table = new Table([
            ["c1", "c2"],
            ["v1", "v2"],
            ["v3", "v4"],
        ], [ Alignment.Left, Alignment.Left ]);
        const expectedSeparator = new RowViewModel([]);
        const expectedRow = new RowViewModel([]);

        _rowVmb
            .setup(m => m.buildSeparator(It.isAny()))
            .returns(() => expectedSeparator)
            .verifiable(Times.once());
        _rowVmb
            .setup(m => m.buildRow(It.isAny()))
            .returns(() => expectedRow)
            .verifiable(Times.exactly(3));

        const vmb = createViewModelBuilder();
        vmb.build(table);

        _rowVmb.verifyAll();
    });

    test("build() returns expected view model properties", () => {
        const table = new Table([
            ["c1", "c2"],
            ["v1", "v2"],
            ["v3", "v4"],
        ], [ Alignment.Left, Alignment.Left ]);
        const expectedSeparator = new RowViewModel([]);
        const expectedRow = new RowViewModel([]);
        _rowVmb.setup(m => m.buildSeparator(It.isAny())).returns(() => expectedSeparator)
        _rowVmb.setup(m => m.buildRow(It.isAny())).returns(() => expectedRow);

        const tableVm = createViewModelBuilder().build(table);

        assertExt.isNotNull(tableVm);
        assert.equal(tableVm.header, expectedRow);
        assert.equal(tableVm.separator, expectedSeparator);
        assertExt.isNotNull(tableVm.rows);
        assert.equal(tableVm.rows.length, 2);
        assert.equal(tableVm.rows[0], expectedRow);
        assert.equal(tableVm.rows[1], expectedRow);
    });

    test("build() with table having left border sets hasLeftBorder on viewModel", () => {
        const table = new Table([
            ["", "c1", "c2"],
            ["", "v1", "v2"],
            ["", "v3", "v4"],
        ], [ Alignment.Left, Alignment.Left, Alignment.Left ]);
        const expectedSeparator = new RowViewModel([]);
        const expectedRow = new RowViewModel([]);

        const tableVm = createViewModelBuilder().build(table);

        assertExt.isNotNull(tableVm);
        assert.equal(tableVm.hasLeftBorder, true);
    });

    test("build() with table without left border sets hasLeftBorder on viewModel to false", () => {
        const table = new Table([
            ["c1", "c2"],
            ["v1", "v2"],
            ["v3", "v4"],
        ], [ Alignment.Left, Alignment.Left ]);
        const expectedSeparator = new RowViewModel([]);
        const expectedRow = new RowViewModel([]);

        const tableVm = createViewModelBuilder().build(table);

        assertExt.isNotNull(tableVm);
        assert.equal(tableVm.hasLeftBorder, false);
    });

    test("build() with table having right border sets hasRightBorder on viewModel", () => {
        const table = new Table([
            ["c1", "c2", ""],
            ["v1", "v2", ""],
            ["v3", "v4", ""],
        ], [ Alignment.Left, Alignment.Left, Alignment.Left ]);
        const expectedSeparator = new RowViewModel([]);
        const expectedRow = new RowViewModel([]);

        const tableVm = createViewModelBuilder().build(table);

        assertExt.isNotNull(tableVm);
        assert.equal(tableVm.hasRightBorder, true);
    });

    test("build() with table without right border sets hasRightBorder on viewModel to false", () => {
        const table = new Table([
            ["c1", "c2"],
            ["v1", "v2"],
            ["v3", "v4"],
        ], [ Alignment.Left, Alignment.Left ]);
        const expectedSeparator = new RowViewModel([]);
        const expectedRow = new RowViewModel([]);

        const tableVm = createViewModelBuilder().build(table);

        assertExt.isNotNull(tableVm);
        assert.equal(tableVm.hasRightBorder, false);
    });

    /* TODO: 
        Move the CJK test from this class to somewhere else when possible.
    */

    test("build() with CJK characters returns expected view model", () => {
        const table = new Table([
            ["h", "h"],
            ["𠁻", "𣄿 content"]
        ], [ Alignment.Left, Alignment.Left ]);
        const vmb = new TableViewModelBuilder(new RowViewModelBuilder(new PadCalculator()));
        const vm = vmb.build(table);

        assertViewModelPropertiesSet(vm);
        assert.equal(vm.header.getValueAt(0), "h  ");
        assert.equal(vm.header.getValueAt(1), " h");
        assert.equal(vm.separator.getValueAt(0), "---");
        assert.equal(vm.separator.getValueAt(1), "------------");
        assert.equal(vm.rows.length, 1);
        assert.equal(vm.rows[0].getValueAt(0), "𠁻 ");
        assert.equal(vm.rows[0].getValueAt(1), " 𣄿 content");
    });

    function assertViewModelPropertiesSet(viewModel: TableViewModel) {
        assertExt.isNotNull(viewModel);
        assertExt.isNotNull(viewModel.header);
        assertExt.isNotNull(viewModel.separator);
        assertExt.isNotNull(viewModel.rows);
    }

    function createViewModelBuilder(): TableViewModelBuilder {
        return new TableViewModelBuilder(_rowVmb.object);
    }
});