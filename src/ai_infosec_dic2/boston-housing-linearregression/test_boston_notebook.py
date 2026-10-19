import json
from pathlib import Path

def test_notebook():
    nb_path = Path("src/ai_infosec_dic2/boston-housing-linearregression/boston-housing-with-linear-regression.ipynb")
    assert nb_path.exists(), f"Notebook file does not exist: {nb_path}"
    
    with open(nb_path, "r", encoding="utf-8") as f:
        nb = json.load(f)
        
    cells = nb.get("cells", [])
    print(f"Total cells: {len(cells)}")
    assert len(cells) == 21, f"Expected 21 cells, got {len(cells)}"
    
    code_cells = [c for c in cells if c.get("cell_type") == "code"]
    print(f"Code cells: {len(code_cells)}")
    assert len(code_cells) == 10, f"Expected 10 code cells, got {len(code_cells)}"
    
    # Check for execution errors in any cell
    error_count = 0
    image_count = 0
    html_count = 0
    
    for idx, cell in enumerate(code_cells):
        outputs = cell.get("outputs", [])
        assert len(outputs) > 0 or idx == 0, f"Code cell {idx} has no outputs!"
        for out in outputs:
            if out.get("output_type") == "error":
                print(f"Error in cell {idx}: {out.get('ename')} - {out.get('evalue')}")
                error_count += 1
            if "data" in out:
                if "image/png" in out["data"]:
                    image_count += 1
                if "text/html" in out["data"]:
                    html_count += 1
                    
    print(f"Execution errors: {error_count}")
    print(f"Rendered PNG images: {image_count}")
    print(f"Rendered HTML tables: {html_count}")
    
    assert error_count == 0, f"Found {error_count} cell execution errors!"
    assert image_count >= 5, f"Expected at least 5 rendered figures, got {image_count}"
    assert html_count >= 5, f"Expected at least 5 HTML tables, got {html_count}"
    print("ALL NOTEBOOK TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_notebook()
