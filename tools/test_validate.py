"""Guardrail tests for invalid asset hierarchies; no tenant connection."""
import unittest,copy,json
from pathlib import Path
from validate import validate
class Guardrails(unittest.TestCase):
    def setUp(self): self.assets=json.loads((Path(__file__).resolve().parents[1]/'data/assets.json').read_text(encoding='utf-8'))
    def test_valid_baseline(self): self.assertEqual(validate(self.assets),[])
    def test_duplicate_code(self):
        self.assets.append(copy.deepcopy(self.assets[-1])); self.assertIn('duplicate asset code',validate(self.assets))
    def test_missing_parent(self):
        self.assets[-1]['parent_id']='NOT-A-PARENT'; self.assertTrue(any('parent' in e for e in validate(self.assets)))
    def test_existing_facility_is_rejected(self):
        self.assets[0]['asset_id']='A26'; self.assertIn('existing facility included as update row',validate(self.assets))
    def test_child_before_parent_is_rejected(self):
        self.assets[0],self.assets[-1]=self.assets[-1],self.assets[0]; self.assertTrue(any('out-of-order' in e for e in validate(self.assets)))
    def test_unreviewed_verified_catalog_is_rejected(self):
        self.assets[-1]['catalog_number_verified']='GUESS'; self.assertIn('unreviewed verified catalog number',validate(self.assets))
if __name__=='__main__': unittest.main()
